window.addEventListener("load", function () {
  if (!window.UAParser) {
    return;
  }

  var uap = new window.UAParser();
  var uapResult = uap.getResult();
  console.info(uapResult);
  var elm = document.getElementById("update-browser");
  var close = document.getElementById("update-browser-close");

  if (!close || !elm) {
    return;
  }

  close.addEventListener("click", function () {
    elm.style.display = "none";
    close.style.display = "none";
  });

  switch (uapResult.browser.name) {
    case "Chrome":
      if (uapResult.browser.major <= 88) {
        elm.innerHTML =
          "<div><strong>Por favor, atualize a versão do seu navegador.</strong> </div><div>A versão que você está utilizando está desatualizada e não é compatível com a NoHarm.</div>";
        elm.style.display = "flex";
        close.style.display = "block";
      }
      break;
    case "IE":
      elm.innerHTML =
        "<div>O navegador <strong>Internet Explorer</strong> não é suportado.</div> <div>Por favor, utilize um dos seguintes navegadores: Chrome, Firefox, Edge ou Safari.</div>";
      elm.style.display = "flex";
      close.style.display = "block";
      break;
  }
});
