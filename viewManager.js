$(document).ready(function () {
  const $homeLink = $("#homeLink");
  const $helpLink = $("#helpLink");
  const $settingsLink = $("#settingsLink");
  const $homeView = $("#homeView");
  const $helpView = $("#helpView");
  const $settingsView = $("#settingsView");

  let $currentView = $homeView;

  $helpView.hide();
  $settingsView.hide();

  $settingsLink.on("click", () => {
    changeView($settingsView);
  });
  $homeLink.on("click", () => {
    changeView($homeView);
  });
  $helpLink.on("click", () => {
    changeView($helpView);
  });

  function changeView($view) {
    $currentView.hide();
    $view.show();
    $currentView = $view;
    console.log("Current View", $currentView[0].id);
  }
});
