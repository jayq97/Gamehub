<?php
include("db/dataHandler.php");

class SimpleLogic
{
    private $dh;

    public function __construct()
    {
        $this->dh = new DataHandler();
    }

    public function handleRequest($method, $param)
    {
        switch ($method) {

            case "getUserByID":
                $res = $this->dh->getUserByID($param);
                break;
            case "getFriends":
                $res = $this->dh->getFriends($param);
                break;
            case "getFriendRequests":
                $res = $this->dh->getFriendRequests($param);
                break;
                
            case "getFriendRequestsSent":
                $res = $this->dh->getFriendRequestsSent($param);
                break;
            case "searchUser":
                $res = $this->dh->searchUser($param);
                break;
            case "acceptFriendRequest":
                $res = $this->dh->acceptFriendRequest($param);
                break;
            case "sendFriendRequest":
                $res = $this->dh->sendFriendRequest($param);
                break;
            case "getChatHistory":
                $res = $this->dh->getChatHistory($param);
                break;
            case "sendMsg":
                $res = $this->dh->sendMsg($param);
                break;
            case "deleteUser":
                $res = $this->dh->deleteUser($param);
                break;
            case "deleteFriendship":
                $res = $this->dh->deleteFriendship($param);
                break;
            default:
                $res = null;
                break;
        }
        return $res;
    }
}
