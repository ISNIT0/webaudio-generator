"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var WAGenNode = /** @class */ (function () {
    function WAGenNode(_kind, _type, _options) {
        kind = _kind;
        type = _type;
        options = _options;
    }
    WAGenNode.prototype.initWANode = function () {
        return Promise.resolve();
    };
    return WAGenNode;
}());
var CustomNode = /** @class */ (function (_super) {
    __extends(CustomNode, _super);
    function CustomNode() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return CustomNode;
}(WAGenNode));
