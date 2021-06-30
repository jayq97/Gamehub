<?php
session_start();

?>

<!doctype html>
<html lang="en">
<head>
    <!-- Required meta tags -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
    <link rel="stylesheet" href="css/website.css">
    <link rel="stylesheet" href="css/uno.css">
    <link rel="stylesheet" href="css/chess.css">
    <link rel="stylesheet" href="css/uno-chat.css">

    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
    <script src="https://kit.fontawesome.com/91ccbca207.js" crossorigin="anonymous"></script>
    <script src="chat.js" defer></script>
    <title>GameHub</title>
</head>
<body>
<?php
include_once "../Backend/db/dataHandler.php";
include_once "../Backend/models/User.php";

include_once "inc/phpHandler.php";

include_once "inc/loginForm.html";
include_once "inc/registerForm.html";

?>

<nav class="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
  <a class="navbar-brand" href="?menu=home">Home</a>
  <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
    <span class="navbar-toggler-icon"></span>
  </button>

  <div class="collapse navbar-collapse" id="navbarSupportedContent">
    <ul class="navbar-nav mr-auto">
      <?php
        if (!isset($_SESSION["username"])) {
            echo "<li class='nav-item'><a class='nav-link' href='#modalLoginForm' data-toggle='modal'>Login</a></li>";
        }
        if (isset($_SESSION['userRole']) && $_SESSION['userRole'] == "admin") {
            echo"<li class='nav-item'><a class='nav-link' href='?menu=userManagement'>User Management</a></li>";
        }
        if (isset($_SESSION['id'])) {
            echo"<li class='nav-item'><a class='nav-link' href='?menu=friends'>Friends</a></li>";
        }
        if (isset($_SESSION["username"])) {
            echo "<li class='nav-item'><a class='nav-link' href='?menu=logout'>Logout</a></li>";
        }
      ?>
    </ul>
    <?php
      if (isset($_SESSION['id'])) {
          echo "<span class='navbar-text'>" . $_SESSION['username'] . " #</span> ";
          echo "<span class='navbar-text' id ='userId'>" . $_SESSION['id'] . "</span>";
      }
    ?>

  </div>
</nav>
<div class="container">

<?php

if (!isset($_GET['menu'])) {
    include_once 'inc/home.html';
} else {
    switch ($_GET['menu']) {
        case 'home':
            include_once 'inc/home.html';
            break;
        case 'userManagement':
            if (isset($_SESSION['userRole']) && $_SESSION['userRole'] == "admin" && isset($_SESSION['id'])) {
                include_once 'inc/userManagement.php';
                break;
            } else {
                include_once 'inc/home.html';
                break;
            }
            // no break
        case 'friends':
            if (isset($_SESSION['id'])) {
                include_once 'inc/friends.html';
                break;
            } else {
                include_once 'inc/home.html';
                break;
            }
            // no break
        case 'uno':
        if (isset($_SESSION['id'])) {
            include_once 'inc/Uno.html';
            break;
        } else {
            include_once 'inc/home.html';
            break;
        }
        case 'chess':
        if (isset($_SESSION['id'])) {
            include_once 'inc/chess.html';
            break;
        } else {
            include_once 'inc/home.html';
            break;
        }
        // no break
        default:
            include_once 'inc/home.html';
            break;
        
    }
}
?>
</div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js" integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" crossorigin="anonymous"></script>
<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js" integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM" crossorigin="anonymous"></script>
</body>
</html>