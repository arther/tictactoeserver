const _getInnerboxClass = function (value) {
  return value === "A" ? 'x' : 'o'
}

const refreshBoxes = function (matrix) {
  const boxes = $(".box-content");
  boxes.each(function (index, element) {
    const value = matrix[index];
    if (value !== 'x') {
      const className = _getInnerboxClass(value)
      $(element).addClass(className);
    }
  });
}

export default class GameHandler {
  constructor(gamestate){
    this.state = gamestate
  }

  change(state){
    this.state = state
    refreshBoxes(state.matrix)
  }

  reset(){
    this.state = {}
  }

  tie() {
    alert("Game Tie")
  }
}