exports.get404Page = (req, res, next) => {
  res.status(404).render("errors/404", { title: "Page is not found" });
};
exports.get500Page = (req, res, next) => {
  res.status(500).render("errors/500", { title: "Error" });
};
