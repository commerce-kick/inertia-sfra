import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { sync } from "glob";
import { basename, dirname, join, relative, resolve } from "path";
import type { Plugin, ViteDevServer } from "vite";

/**
 * Vite plugin generating TypeScript interfaces from the cartridge BaseData
 * DTO schemas, the sibling of vite-routes-plugin: controllers feed typed
 * route helpers, DTOs feed typed prop shapes. One interface file per DTO
 * lands in the output dir plus an index barrel; never hand-edit them.
 *
 * Parsing contract (see scripts/data/*.js):
 * - a DTO file calls `BaseData.extend({ schema: { ... } })`
 * - a schema field with a JSDoc `@type {...}` comment uses that TS type
 * - `type: "collection", of: X` maps to `IX[]`, `type: "data", of: X` to `IX`
 * - primitive `type` strings map directly; `transform` without a JSDoc hint
 *   degrades to `unknown` (add the hint instead of shipping that)
 * - fields with a `default` are always present; the rest are optional
 */

export interface SfccDtoTypesOptions {
  source?: { pattern?: string; ignore?: string[] };
  output?: { dir?: string };
}

interface FieldDef {
  name: string;
  tsType: string;
  optional: boolean;
  description?: string;
  refs: string[];
}

interface DtoDef {
  className: string;
  fields: FieldDef[];
  source: string;
}

const PRIMITIVES: Record<string, string> = {
  string: "string",
  number: "number",
  boolean: "boolean",
  object: "Record<string, unknown>",
};

function toInterfaceName(className: string): string {
  return `I${className}`;
}

function toFileName(className: string): string {
  return className.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

/** Extract a balanced {...} block starting at the first `{` at or after `from`. */
function balancedBlock(content: string, from: number): string | null {
  const start = content.indexOf("{", from);
  if (start === -1) return null;
  let depth = 0;
  for (let i = start; i < content.length; i++) {
    if (content[i] === "{") depth++;
    else if (content[i] === "}") {
      depth--;
      if (depth === 0) return content.slice(start, i + 1);
    }
  }
  return null;
}

/** Extract the type inside a JSDoc `@type {...}` allowing nested braces. */
function jsDocType(comment: string): string | null {
  const at = comment.indexOf("@type");
  if (at === -1) return null;
  const block = balancedBlock(comment, at);
  return block ? block.slice(1, -1).trim() : null;
}

/** Description = JSDoc text after the closing brace of @type {...}. */
function jsDocDescription(comment: string): string | undefined {
  const at = comment.indexOf("@type");
  if (at === -1) return undefined;
  const block = balancedBlock(comment, at);
  if (!block) return undefined;
  const rest = comment
    .slice(comment.indexOf(block, at) + block.length)
    .replace(/\*\/[\s\S]*$/, "")
    .replace(/^[\s*]+|[\s*]+$/g, "")
    .trim();
  return rest || undefined;
}

function parseSchemaFields(schemaBody: string): FieldDef[] {
  const fields: FieldDef[] = [];
  // Walk top-level `key: {...}` entries of the schema object, keeping the
  // JSDoc comment (if any) that immediately precedes each key.
  const inner = schemaBody.slice(1, -1);
  let i = 0;
  let pendingComment: string | null = null;

  while (i < inner.length) {
    const ch = inner[i];

    if (ch === "/" && inner.startsWith("/**", i)) {
      const end = inner.indexOf("*/", i);
      if (end === -1) break;
      pendingComment = inner.slice(i, end + 2);
      i = end + 2;
      continue;
    }

    const keyMatch = /^[A-Za-z_$][\w$]*(?=\s*:)/.exec(inner.slice(i));
    if (keyMatch && /[\s,{]/.test(inner[i - 1] ?? "{")) {
      const name = keyMatch[0];
      const block = balancedBlock(inner, i + name.length);
      if (!block) break;

      const refs: string[] = [];
      let tsType: string | null = pendingComment
        ? jsDocType(pendingComment)
        : null;

      const ofMatch = /of:\s*([A-Za-z_$][\w$]*)/.exec(block);
      const typeMatch = /type:\s*["']([a-z]+)["']/.exec(block);

      if (!tsType && ofMatch && typeMatch?.[1] === "collection") {
        tsType = `${toInterfaceName(ofMatch[1])}[]`;
        refs.push(ofMatch[1]);
      } else if (!tsType && ofMatch && typeMatch?.[1] === "data") {
        tsType = toInterfaceName(ofMatch[1]);
        refs.push(ofMatch[1]);
      } else if (!tsType && typeMatch && PRIMITIVES[typeMatch[1]]) {
        tsType = PRIMITIVES[typeMatch[1]];
      } else if (tsType && ofMatch) {
        refs.push(ofMatch[1]);
      }

      fields.push({
        name,
        tsType: tsType ?? "unknown",
        optional: !/default\s*:/.test(block),
        description: pendingComment
          ? jsDocDescription(pendingComment)
          : undefined,
        refs,
      });

      pendingComment = null;
      i = inner.indexOf(block, i) + block.length;
      continue;
    }

    i++;
  }

  return fields;
}

function parseDtoFile(file: string, cwd: string): DtoDef | null {
  const content = readFileSync(file, "utf-8");
  const extendMatch =
    /var\s+([A-Za-z_$][\w$]*)\s*=\s*BaseData\.extend\s*\(/.exec(content);
  if (!extendMatch) return null;

  const schemaAt = content.indexOf("schema:", extendMatch.index);
  if (schemaAt === -1) return null;
  const schemaBody = balancedBlock(content, schemaAt);
  if (!schemaBody) return null;

  return {
    className: extendMatch[1],
    fields: parseSchemaFields(schemaBody),
    source: relative(cwd, file),
  };
}

function generateInterfaceFile(dto: DtoDef, outputDir: string): void {
  const importLines = [...new Set(dto.fields.flatMap((f) => f.refs))]
    .filter((ref) => ref !== dto.className)
    .map(
      (ref) =>
        `import type { ${toInterfaceName(ref)} } from "./${toFileName(ref)}";`
    );

  const fieldLines = dto.fields.map((f) => {
    const doc = f.description ? `  /** ${f.description} */\n` : "";
    return `${doc}  ${f.name}${f.optional ? "?" : ""}: ${f.tsType};`;
  });

  const content = `// Auto-generated by vite-plugin-sfcc-dto-types
// Source: ${dto.source}
// Do not edit this file manually
${importLines.length ? `\n${importLines.join("\n")}\n` : ""}
export interface ${toInterfaceName(dto.className)} {
${fieldLines.join("\n")}
}
`;

  writeFileSync(join(outputDir, `${toFileName(dto.className)}.ts`), content);
}

export default function sfccDtoTypesPlugin(
  options: SfccDtoTypesOptions = {}
): Plugin {
  const sourcePattern =
    options.source?.pattern ?? "**/cartridge/scripts/data/*.js";
  const sourceIgnore = options.source?.ignore ?? ["**/node_modules/**"];
  const outputDir = resolve(
    process.cwd(),
    options.output?.dir ?? "./app/generated/data"
  );

  function generate(): void {
    const files = sync(sourcePattern, {
      absolute: true,
      ignore: sourceIgnore,
      cwd: process.cwd(),
    });

    const dtos = files
      .map((file) => parseDtoFile(file, process.cwd()))
      .filter((dto): dto is DtoDef => dto !== null);

    if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });

    dtos.forEach((dto) => generateInterfaceFile(dto, outputDir));

    const index = `// Auto-generated by vite-plugin-sfcc-dto-types
// Do not edit this file manually

${dtos
  .map(
    (dto) =>
      `export type { ${toInterfaceName(dto.className)} } from "./${toFileName(dto.className)}";`
  )
  .join("\n")}
`;
    writeFileSync(join(outputDir, "index.ts"), index);

    console.log(
      `[sfcc-dto-types] ✓ Generated ${dtos.length} DTO interfaces → ${relative(process.cwd(), outputDir)}`
    );

    const untyped = dtos.flatMap((dto) =>
      dto.fields
        .filter((f) => f.tsType === "unknown")
        .map((f) => `${dto.className}.${f.name}`)
    );
    if (untyped.length) {
      console.warn(
        `[sfcc-dto-types] ⚠️  transform fields missing a JSDoc @type hint: ${untyped.join(", ")}`
      );
    }
  }

  return {
    name: "vite-plugin-sfcc-dto-types",
    enforce: "pre",

    buildStart() {
      generate();
    },

    configureServer(server: ViteDevServer) {
      const handleChange = (file: string | undefined) => {
        if (
          file &&
          file.endsWith(".js") &&
          basename(dirname(file)) === "data" &&
          file.includes("cartridge/scripts")
        ) {
          console.log(
            `[sfcc-dto-types] DTO changed: ${relative(process.cwd(), file)}`
          );
          generate();
        }
      };

      server.watcher.on("change", handleChange);
      server.watcher.on("add", handleChange);
      server.watcher.on("unlink", handleChange);

      generate();
    },
  };
}
