const getInnerboxClass = function (value) {
  return value === "A" ? 'x' : 'o'
}

const refreshBoxes = function (matrix) {
  const boxes = $(".box-content");
  boxes.each(function (index, element) {
    const value = matrix[index];
    if (value !== 'x') {
      const className = getInnerboxClass(value)
      $(element).addClass(className);
    }
  });
}

const handleState = function(data) {
  const state = data.state;
  if(data.error){
    alert(error)
    window.location.href = "/";
    return;
  }
  refreshBoxes(state);
  if (state.result) {
    $('.result').text("Player " + getInnerboxClass(data.result) + " won")
    $('.result-alert').removeClass('hide')
    // $('.result-alert').addClass('show')
  }
  if (state.tie) {
    $('.result-alert').removeClass('hide')
    $('.result').text("Game Tie")
  }
}

const markPositon = function (id) {
  const name = $('.name')[0].id
  $.post("/api/mark-position", { position: id, name: name }, function (data) {
    handleState(data);
  });
}

const getGameName = function(){
  return $('.name')[0].id
}

const restartGame = function() {
  window.location.href = `/games/${getGameName()}/restart`
}

const closeGame = function() {
  window.location.href = `/games/${getGameName()}/close`
}

$(document).ready(function () {
  $('body').on('click', '#restart-btn', function(e) {
    restartGame()
  });

  $('body').on('click', '#close-btn', function(e) {
    closeGame()
  });

  $(".box").on('click', function (event) {
    markPositon(event.target.id);
  });
  (function pollState() {
    setTimeout(function () {
      const name = getGameName()
      console.log("Poll")
      if (name) {
        console.log("Poll hitting api")
        $.ajax({
          url: "/api/games/" + name, success: function (data) {
            console.log("Poll - response", data)
            handleState(data)
          }, dataType: "json", complete: pollState
        });
      }
    }, 2000);
  })()
});