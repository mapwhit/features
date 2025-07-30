function expand(result, e) {
  result[e] = e;
  return result;
}

const drag = ['dragstart', 'drag', 'dragend'].reduce(expand, {});

const mouse = [
  'click',
  'mouseenter',
  'mouseleave',
  'mousemove',
  'mouseover',
  'mouseout',
  'dragstart',
  'drag',
  'dragend',
  'touchstart',
  'touchmove',
  'touchend'
].reduce(expand, {});

export { drag, mouse };
