import { Badge } from "@/components/ui/badge";
import Layout from "@/layouts/default";
import { useState, useEffect, useMemo } from "react";
import { Virtuoso } from "react-virtuoso";

// Define the data type
interface DataItem {
  name: string;
  language: string;
  id: string;
  bio: string;
  version: number;
}

interface FiveProps {
  data: DataItem[];
}

const Five = ({ data }: FiveProps) => {
  // Store data in state
  const [items, setItems] = useState<DataItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Load data on component mount
  useEffect(() => {
    if (data) {
      setItems(data);
      setIsLoading(false);
    }
  }, [data]);

  // Filter data based on search term
  const filteredItems = useMemo(() => {
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.language.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.bio.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [items, searchTerm]);

  // Calculate random background colors based on language (consistent per language)
  const getLanguageColor = (language: string) => {
    // Simple hash function for consistent colors
    const hash = language.split("").reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    return `hsl(${Math.abs(hash % 360)}, 70%, 90%)`;
  };

  // Render loading state
  if (isLoading) {
    return <div className="p-4">Loading data...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Data Explorer</h1>

      {/* Search input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name, language, ID, or bio..."
          className="w-full p-2 border rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Stats */}
      <div className="mb-4 text-sm">
        <p>Total items: {items.length}</p>
        <p>Filtered items: {filteredItems.length}</p>
      </div>

      {/* Virtuoso list */}
      <div className="border rounded">
        <Virtuoso
          style={{ height: 600 }}
          data={filteredItems}
          totalCount={filteredItems.length}
          overscan={200}
          itemContent={(index, item) => {
            const bgColor = getLanguageColor(item.language);
            // Vary the size a bit based on bio length
            return (
              <div className="bg-background p-4 border border-border hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-lg">{item.name}</h3>
                  <Badge>
                    {item.language}
                  </Badge>
                </div>

                <div className="text-sm">{item.bio}</div>

                <div className="text-xs text-muted mt-1">
                  ID: {item.id} • Version: {item.version}
                </div>
              </div>
            );
          }}
          components={{
            Header: () => (
              <div className="p-2  border-b sticky top-0 text-sm font-medium">
                Displaying {filteredItems.length} items
              </div>
            ),
            Footer: () => (
              <div className="p-2  border-t text-center text-sm">
                End of list • {filteredItems.length} items total
              </div>
            ),
            EmptyPlaceholder: () => (
              <div className="p-10 text-center ">
                No results found. Try adjusting your search.
              </div>
            ),
          }}
        />
      </div>
    </div>
  );
};

//@ts-ignore
Five.layout = (page) => <Layout>{page}</Layout>;

export default Five;
