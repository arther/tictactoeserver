const getInnerboxClass = function(value){
  return value === "A" ? 'x' : 'o'
}

const refreshBoxes = function (matrix) {
  const boxes = $(".box-content");
  boxes.each(function(index, element){
    const value = matrix[index];
    if(value !== 'x'){
      const className = getInnerboxClass(value)
      $(element).addClass(className);
    }
  });
}

const markPositon = function(id) {
  const name = $('.name')[0].id
  $.post( "/api/mark-position", {position: id, name: name}, function( data ) {
    refreshBoxes(data.state)
    if(data.result){
      $('.result').text("Player " + getInnerboxClass(data.result) + " won")  
    }
    if(data.tie){
      $('.result').text("Game Tie")  
    }
    
  });
}

$(document).ready(function(){
  $(".box").on('click', function(event){
    markPositon(event.target.id);
});
});