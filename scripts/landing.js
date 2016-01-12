var scrollFn = (function () {

  return function (event) {
    var points = document.getElementsByClassName('point');

    var revealPoint = function (ptIndex) {
      points[ptIndex].style.opacity = 1;
      points[ptIndex].style.transform = "scaleX(1) translateX(0)";
      points[ptIndex].style.msTransform = "scaleX(1) translateX(0)";
      points[ptIndex].style.WebkitTransform = "scaleX(1) translateX(0)";
    }

    for (var i = 0; i < points.length; i++) {
      revealPoint(i);
    }
  }
})();

window.addEventListener('scroll', scrollFn);