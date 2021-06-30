var server =
  "../Backend/serviceHandler.php";

var interval: any = null;

function getFriends() {
  var id = $("#userId").html();
  var spinner = $("<div>");
  var div = $("#friends");
  div.children().remove();
  spinner.attr("role", "status");
  spinner.addClass("spinner-border text-primary");
  spinner.append($('<span class="sr-only">Loading...</span>'));
  div.append(spinner);
  $.ajax({
    type: "GET",
    url: server,
    cache: false,
    data: { method: "getFriends", param: id },
    dataType: "json",
    success: function (response) {
      response.forEach((entry: number) => {
        getUserByID(entry, "getFriends");
      });
      div.children()[0].remove();
    },
    error: function () {
      div.children()[0].remove();
      var newDiv = $("<div>");
      var colDiv = $("<div>");
      newDiv.addClass("row align-items-center");
      colDiv.addClass("col-12");
      colDiv.html("No friends yet!");
      div.append(newDiv.append(colDiv));
    }
  });
}

function getUserByID(id: number, method: string) {
  $.ajax({
    type: "GET",
    url: server,
    cache: false,
    data: { method: "getUserByID", param: id },
    dataType: "json",
    success: function (response) {
      if (method === "getFriendRequests") {
        var div = $("#friendRequests");
        var divRow = $("<div>");
        divRow.addClass("row align-items-center");
        var divCol1 = $("<div>");
        divCol1.addClass("col-3");
        divCol1.html(response[1]);
        var divCol2 = $("<div>");
        divCol2.addClass("col-9");
        var newButton = $("<button>");
        newButton.html("Accept");
        newButton.attr("type", "button");
        newButton.attr("id", "FR" + response[0]);
        newButton.addClass("btn btn-success");
        newButton.click(function () {
          acceptFriendRequest(response[0]);
          divRow.remove();
        });
        divRow.append(divCol1);
        divRow.append(divCol2.append(newButton));
        div.append(divRow);
      }

      if (method === "getFriends") {
        var div = $("#friends");
        var divRow = $("<div>");
        divRow.addClass("row align-items-center mt-2");
        var divCol1 = $("<div>");
        divCol1.addClass("col-4");
        var divCol2 = $("<div>");
        divCol2.addClass("col-8");

        var btn = $("<button>");
        btn.html("Chat");
        btn.addClass("btn btn-primary");
        btn.click(function () {
          getChatHistory(response[0]);
        });
        divCol2.append(btn);

        var rmvFriendBtn = $("<button>");
        rmvFriendBtn.html("Remove");
        rmvFriendBtn.addClass("btn btn-danger ml-2");
        rmvFriendBtn.click(function(){
          removeFriend(response[0]);
        })
        divCol2.append(rmvFriendBtn);

        var div3 = $("<div>");
        div3.html(response[1]);
        divCol1.append(div3);
        divRow.append(divCol1);
        divRow.append(divCol2);
        div.append(divRow);
      }
    },
    error: function () {
      console.log("ERROR");
    },
  });
}

function getFriendRequests() {
  var id = $("#userId").html();
  var div = $("#friendRequests");
  div.children().remove();
  var spinner = $("<div>");
  spinner.attr("role", "status");
  spinner.addClass("spinner-border text-primary");
  spinner.append($('<span class="sr-only">Loading...</span>'));
  div.append(spinner);
  $.ajax({
    type: "GET",
    url: server,
    cache: false,
    data: { method: "getFriendRequests", param: id },
    dataType: "json",
    success: function (response) {
      response.forEach((entry: number) => {
        getUserByID(entry, "getFriendRequests");
      });
      div.children()[0].remove();
    },
    error: function () {
      div.children()[0].remove();
      var newDiv = $("<div>");
      var colDiv = $("<div>");
      newDiv.addClass("row align-items-center");
      colDiv.addClass("col-12");
      colDiv.html("No friendrequests yet!");
      div.append(newDiv.append(colDiv));
    },
  });
}

function removeFriend(id: number){
  var idArray = new Array();
  idArray.push($("#userId").html());
  idArray.push(id);
  $.ajax({
    type: "POST",
    url: server,
    cache: false,
    data: { method: "deleteFriendship", param: idArray },
    dataType: "json",
    success: function (response) {
      getFriends();
    },
    error: function () {
    }
  });
}

function checkIfFriend(friendId: number) {
  var id = $("#userId").html();
  var div = $("div #" + friendId);
  var bool = false;
  $.ajax({
    type: "GET",
    url: server,
    cache: false,
    data: { method: "getFriends", param: id },
    dataType: "json",
    success: function (response) {
      response.forEach((entry: number) => {
        if (friendId === entry) {
          bool = true;
        }
      });
      if (bool === true) {
        div.html("Already friends");
      } else {
        checkFRSent(friendId);
      }
    },
    error: function () {
      checkFRSent(friendId);
    },
  });
}

function checkFRSent(friendId: number) {
  var id = $("#userId").html();
  var div = $("div #" + friendId);
  var bool = false;
  $.ajax({
    type: "GET",
    url: server,
    cache: false,
    data: { method: "getFriendRequestsSent", param: id },
    dataType: "json",
    success: function (response) {
      response.forEach((entry: number) => {
        if (friendId === entry) {
          bool = true;
        }
      });
      if (bool === true) {
        div.html("Pending");
      } else {
        checkFRaccept(friendId);
      }
    },
    error: function () {
      checkFRaccept(friendId);
    },
  });
}

function checkFRaccept(friendId: number) {

  var id = $("#userId").html();
  var div = $("div #" + friendId);
  var bool = false;
  $.ajax({
    type: "GET",
    url: server,
    cache: false,
    data: { method: "getFriendRequests", param: id },
    dataType: "json",
    success: function (response) {
      response.forEach((entry: number) => {
        if (friendId === entry) {
          bool = true;
        }
      });
      var btn = $("<button>");
      if (bool === true) {
        btn.html("Accept Friend-Request");
        btn.addClass("btn btn-success");
        btn.click(function () {
          acceptFriendRequest(friendId);
          div.children().remove();
          div.html('Already friends');
        });

        div.children().remove();
        div.append(btn);
      } else {
        btn.html("Add Friend");
        btn.addClass("btn btn-primary");
        btn.click(function () {
          sendFriendRequest(friendId);
          div.children().remove();
          div.html('Pending');
        });

        div.children().remove();
        div.append(btn);
      }
    },
    error: function () {
      var btn = $("<button>");
      btn.html("Add Friend");
      btn.addClass("btn btn-primary");
      btn.click(function () {
        sendFriendRequest(friendId);
        div.children().remove();
        div.html('Pending');
      });

      div.children().remove();
      div.append(btn);
    },
  });
}

function searchUser() {
  var div = $("#searchOutput");
  var searchValue = $("#search").val();
  if (searchValue !== null && searchValue !== "") {
    searchValue += "%";
    $.ajax({
      type: "GET",
      url: server,
      cache: false,
      data: { method: "searchUser", param: searchValue },
      dataType: "json",
      success: function (response) {
        div.children().remove();
        response.forEach((element: any) => {
          if (element[0] != $("#userId").html()) {
            var divRow = $("<div>");
            divRow.addClass("row align-items-center mt-2");
            var divCol1 = $("<div>");
            divCol1.addClass("col-3");
            var divCol2 = $("<div>");
            divCol2.addClass("col-9");
            divCol2.attr("id", element[0]);
            var div1Input = $("<div>");
            var div2Input = $("<div>");
            div2Input.attr("role", "status");
            div2Input.addClass("spinner-border text-primary");
            div2Input.append($('<span class="sr-only">Loading...</span>'));
            div1Input.html(element[1]);
            divCol1.append(div1Input);
            divCol2.append(div2Input);
            div.append(divRow);
            divRow.append(divCol1);
            divRow.append(divCol2);
            checkIfFriend(element[0]);
          }
        });
      },

      error: function () {
        div.children().remove();
        div.append($('<strong>No such user!</strong>'))
      },
    });
  }
}

function acceptFriendRequest(friendId: number) {
  var idArray = new Array();
  idArray.push($("#userId").html());
  idArray.push(friendId);
  $.ajax({
    type: "POST",
    url: server,
    cache: false,
    data: { method: "acceptFriendRequest", param: idArray },
    dataType: "json",
    success: function (response) {
      console.log(response);
      getFriends();
      getFriendRequests();
    },
    error: function () {
      console.log("ERROR");
    },
  });
}

function sendFriendRequest(id: number) {
  var idArray = new Array();
  idArray.push($("#userId").html());
  idArray.push(id);
  $.ajax({
    type: "POST",
    url: server,
    cache: false,
    data: { method: "sendFriendRequest", param: idArray },
    dataType: "json",
    success: function (response) {
      console.log(response);
    },
    error: function () {
      console.log("ERROR");
    },
  });
}

function getChatHistory(id: number) {
  if (interval != null) {
    clearInterval(interval);
    interval = null;
  }
  var idArray = new Array();
  idArray.push($("#userId").html());
  idArray.push(id);
  $(".chatPopup").show();
  refreshChat(idArray);
  $("#chatHistory").scrollTop($("#chatHistory")[0].scrollHeight);
  interval = setInterval(function () { refreshChat(idArray) }, 10000);
}

function refreshChat(idArray: any) {

  $.ajax({
    type: "GET",
    url: server,
    cache: false,
    data: { method: "getChatHistory", param: idArray },
    dataType: "json",
    success: function (response) {
      $("#chatHistory").children().remove();
      console.log(response);
      response.forEach((element: any) => {
        var msg = element[1];
        var newDiv = $("<div>");
        var newnewDiv = $("<div>");
        newnewDiv.addClass("containerdivNewLine");
        newnewDiv.append(newDiv);
        newDiv.html(msg);

        if (element[0] == idArray[0]) {
          newDiv.addClass("chatSender");
        } else {
          newDiv.addClass("chat");
        }
        $("#chatHistory").append(newnewDiv);
      });
      $("#sendMsg").unbind();
      $("#sendMsg").click(function () {
        sendMsg(idArray[1]);
      });
    },
    error: function () {
      $("#chatHistory").children().remove();
      var newDiv = $("<div>");
      newDiv.addClass("noMsg");
      newDiv.html("No chat history!");
      $("#chatHistory").append(newDiv);
      $("#sendMsg").unbind();
      $("#sendMsg").click(function () {
        $("#chatHistory").children().remove();
        sendMsg(idArray[1]);
      });
    },
  });

}

function sendMsg(id: number) {
  var msgArray = new Array();
  msgArray.push($("#userId").html());
  msgArray.push(id);
  msgArray.push($("#msg").val());
  $.ajax({
    type: "GET",
    url: server,
    cache: false,
    data: { method: "sendMsg", param: msgArray },
    dataType: "json",
    success: function (response) {
      console.log(response);
      var msg = msgArray[2];
      var newDiv = $("<div>");
      var newnewDiv = $("<div>");
      newnewDiv.addClass("containerdivNewLine");
      newnewDiv.append(newDiv);
      newDiv.addClass("chatSender");
      newDiv.html(msg);
      $("#chatHistory").append(newnewDiv);
      $("#msg").val("");
      $("#chatHistory").scrollTop($("#chatHistory")[0].scrollHeight);
    },
    error: function () {
      console.log("ERROR");
    },
  });
}

function deleteUser(id: number) {
  $.ajax({
    type: "GET",
    url: server,
    cache: false,
    data: { method: "deleteUser", param: id },
    dataType: "json",
    success: function (response) {
      location.reload();
    },
    error: function () {
      console.log("ERROR");
    },
  });

}