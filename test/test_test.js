describe("A suite", function() {
  it("contains spec with an expectation", function() {
    browser().navigateTo("index.html");
     console.log(browser().location().url());
  });
});