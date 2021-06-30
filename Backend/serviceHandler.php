<?php
include("logic/simpleLogic.php");

$param = "";
$method = "";
$logic = new SimpleLogic();


if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    isset($_GET["method"]) ? $method = $_GET["method"] : false;
    isset($_GET["param"]) ? $param = $_GET["param"] : false;
    $result = $logic->handleRequest($method, $param);
    if ($result == null) {
        response("GET", 400, null);
    } else {
        response("GET", 200, $result);
    }
} else if($_SERVER['REQUEST_METHOD'] === 'POST'){
    isset($_POST["method"]) ? $method = $_POST["method"] : false;
    isset($_POST["param"]) ? $param = $_POST["param"] : false;
    $result = $logic->handleRequest($method, $param);
    if ($result == null) {
        response("POST", 400, null);
    } else {
        response("POST", 200, $result);
    }

}






function response($method, $httpStatus, $data)
{
    header('Content-Type: application/json');
    switch ($method) {
        case "GET":
            http_response_code($httpStatus);
            echo(json_encode($data));
            break;
        case "POST":
            http_response_code($httpStatus);
            echo(json_encode($data));
            break;
        default:
            http_response_code(405);
            echo("Method not supported yet!");
    }
}
