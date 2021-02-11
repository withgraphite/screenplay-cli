"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeScreenplayManagedTargetsAndProducts = void 0;
function removeScreenplayManagedTargetsAndProducts(xcodeProject) {
    xcodeProject
        .rootObject()
        .targets()
        .forEach((target) => {
        // TODO: At some point we should update this heuristic
        // (Maybe check a custom build setting or something)
        if (target.name().startsWith("Screenplay-")) {
            target
                .buildConfigurationList()
                .buildConfigs()
                .forEach((config) => {
                config.remove();
            });
            target.buildConfigurationList().remove();
            target.buildPhases().forEach((bp) => {
                bp.remove();
            });
            const product = target.product();
            const productRefGroupId = xcodeProject.rootObject()._defn["productRefGroup"];
            xcodeProject._defn["objects"][productRefGroupId]["children"] = xcodeProject._defn["objects"][productRefGroupId]["children"].filter((productId) => {
                return productId !== product._id;
            });
            product.remove();
            xcodeProject.rootObject()._defn["targets"] = xcodeProject
                .rootObject()
                ._defn["targets"].filter((targetId) => {
                return targetId !== target._id;
            });
            target.remove();
        }
    });
}
exports.removeScreenplayManagedTargetsAndProducts = removeScreenplayManagedTargetsAndProducts;
//# sourceMappingURL=uninstall.js.map