const lastEl = {
  ele: undefined as HTMLElement | undefined,
  width: 0,
  height: 0,
  flex: 1
}
const nextEl = {
  ele: undefined as HTMLElement | undefined,
  width: 0,
  height: 0,
  flex: 1
}
let flexSum = 0;
let startX: number;
let startY: number;
let dragging: "" | "width" | "height" = "";

function getNeighborEls(e: MouseEvent, draggingType: "" | "width" | "height") {
  const dividerEl = e.target as HTMLElement;
  const siblingElements = Array.from(dividerEl.parentElement!.children) as HTMLElement[];
  const currentIndex = siblingElements.indexOf(dividerEl);
  lastEl.ele = siblingElements[currentIndex - 1];
  lastEl.width = lastEl.ele.getBoundingClientRect().width;
  lastEl.height = lastEl.ele.getBoundingClientRect().height;
  lastEl.flex = parseFloat(lastEl.ele.style.flex || "1");
  nextEl.ele = siblingElements[currentIndex + 1];
  nextEl.width = nextEl.ele.getBoundingClientRect().width;
  nextEl.height = nextEl.ele.getBoundingClientRect().height;
  nextEl.flex = parseFloat(nextEl.ele.style.flex || "1");

  flexSum = lastEl.flex + nextEl.flex;
  dragging = draggingType;
  startX = e.clientX;
  startY = e.clientY;
}


function onDrag(e: MouseEvent) {

  if (!dragging || lastEl.ele === undefined || nextEl.ele === undefined) {
    return;
  }
  console.log(e, e.target);

  const move = dragging === "width" ? e.clientX - startX : e.clientY - startY;
  const newLastW_H = lastEl[dragging] + move;
  const newNextW_H = nextEl[dragging] - move;
  const newLastRate = newLastW_H / (lastEl[dragging] + nextEl[dragging]);
  const newNextRate = newNextW_H / (lastEl[dragging] + nextEl[dragging]);

  const newLastFlex = newLastRate * flexSum;
  const newNextFlex = newNextRate * flexSum;

  console.log(newLastFlex, newNextFlex, (flexSum - newLastFlex));
  lastEl.ele.style.flex = `${newLastFlex}`;
  nextEl.ele.style.flex = `${newNextFlex}`;

  // if (dragging === "width") {
  //   const moveX = e.clientX - startX;
  //   lastEl.ele.style.width = `${lastEl.width + moveX}px`;
  //   nextEl.ele.style.width = `${nextEl.width - moveX}px`;
  // } else {
  //   const moveY = e.clientY - startY;
  //   lastEl.ele.style.height = `${lastEl.height + moveY}px`;
  //   nextEl.ele.style.height = `${nextEl.height - moveY}px`;
  // }
}

function endDrag() {
  dragging = "";
}

export { getNeighborEls, onDrag, endDrag }