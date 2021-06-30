<?php
$db = new dataHandler();


if (isset($_POST['login'])) {
    $username = $_POST['username'];
    $password = $_POST['password'];

    $loggedin = $db->loginUser($username, $password);
    if ($loggedin == true) {
        $userObject = $db->getUserByUsername($username);
        $_SESSION['login']=true;
        $_SESSION['id'] = $userObject->getId();
        $_SESSION['username'] = $userObject->getUsername();
        $_SESSION['userRole'] = $userObject->getRole();
        

        header("Location: index.php?menu=home");
    } else {
        ?>
        <div class="alert alert-danger alert-dismissible fade show mb-0" role="alert">
            <strong>Wrong username or password!</strong>
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
        <?php
    }
}



if (isset($_POST['register'])) {
    $newUser = new user;
    $username = $_POST['username'];
    $pwd = $_POST['password'];
    $mail = $_POST['email'];


    $newUser->setUsername($username);
    $newUser->setEmail($mail);
    $newUser->setPwd(password_hash($pwd, PASSWORD_DEFAULT));

    $registered = $db->registerUser($newUser);
    if ($registered == true) {
        if (password_verify($pwd, $newUser->getPwd())) {
        }
        ?>
        <div class="alert alert-success alert-dismissible fade show mb-0" role="alert">
            <strong>Registration successful!</strong>
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
        <?php
    } else {
        ?>
        <div class="alert alert-danger alert-dismissible fade show mb-0" role="alert">
            <strong>Username or Email is already in use!</strong>
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
        <?php
    }
}

if(isset($_GET["menu"]) && $_GET["menu"] == "logout"){
    $_SESSION = array();
    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params["path"], $params["domain"],
            $params["secure"], $params["httponly"]
        );
    }
    // Finally, destroy the session.
    session_destroy();
    echo $_SESSION["username"];
    //$_SESSION = array();
    //session_destroy();
    header("Location: index.php?menu=home");
}


