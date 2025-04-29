/* global trace,response */
var ProductMgr = require("dw/catalog/ProductMgr");

function Start() {
    trace("Start called");
    response.getWriter().println("Hello World");
}
Start.public = true;
exports.Start = Start;

function Foo() {
    trace("Foo called");
    response.getWriter().println("Hello World");
}
Foo.public = true;
exports.Foo = Foo;

function Bar() {
    trace("Bar called");

    var product = ProductMgr.getProduct();
    var pam = product.getAttributeModel();
    var resp = {
        groups: pam.visibleAttributeGroups.toArray().map((ag) => ({
            id: ag.ID,
            name: ag.displayName,
        })),
        product: product.name
    };

    response.setContentType("application/json");
    response.getWriter().println(JSON.stringify(resp, null, 2));
}
Bar.public = true;
exports.Bar = Bar;
