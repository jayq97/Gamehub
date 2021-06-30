<?php
include_once "../Backend/models/User.php";

class dataHandler
{
    private $connection;

    public function __construct()
    {
        $this->connection = new mysqli("localhost", "gamehub", "gamehub", "gamehub");
        if ($this->connection->connect_error) {
            die('Connect Error (' . $this->connection->connect_errno . ') ' . $this->connection->connect_error);
            echo "Connection nicht erfolgreich<br>";
        }
    }

    public function registerUser($userObject)
    {
        $sql = $this->connection->prepare("INSERT INTO users 
            (username,mail,password) VALUES (?,?,?)");
        $username = $userObject->getUsername();
        $email = $userObject->getEmail();
        $password = $userObject->getPwd();
        $sql->bind_param("sss", $username, $email, $password);
        if ($sql->execute()) {
            return true;
        } else {
            return false;
        }
    }

    public function loginUser($username, $pwd)
    {
        if ($sql = $this->connection->prepare("SELECT password FROM users WHERE username = ?")) {
            $sql->bind_param("s", $username);
            if ($sql->execute()) {
                $sql->bind_result($dbhash);
                $sql->fetch();
                if (password_verify($pwd, $dbhash)) {
                    return true;
                }
            } else {
                echo "Fehler bei SQL execute.<br>";
            }
        } else {
            echo "Fehler bei LoginUser() prepare Statement.<br>";
        }
    }


    public function getUserByUsername($username)
    {                //FERTIG
        $sql = $this->connection->prepare("SELECT * FROM users WHERE username = ?");
        $sql->bind_param("s", $username);
        if ($sql->execute()) {
            $sql->bind_result($id, $username, $email, $pwd, $role);
            $sql->fetch();
            $newuserObject = new user();
            $newuserObject->setPwd($pwd);
            $newuserObject->setEmail($email);
            $newuserObject->setRole($role);
            $newuserObject->setId($id);
            $newuserObject->setUsername($username);
            return $newuserObject;
        } else {
            echo "Fehler. User nicht ausgelesen.<br>";
            return null;
        }
    }

    

    public function getAllUsers()
    {
        if ($result = $this->connection->query("SELECT * FROM users")) {
            while ($row = $result->fetch_row()) {
                $userObject = new user();
                $userObject->setId($row[0]);
                $userObject->setUsername($row[1]);
                $userObject->setEmail($row[2]);
                $userObject->setPwd($row[3]);
                $userObject->setRole($row[4]);

                $userArray[] = $userObject;
            }
            return $userArray;
        } else {
            echo "Fehler bei sql Query von getAllUsers() in dbaccess.php.<br>";
        }
    }

    public function deleteFriends($userId)
    {
        if ($sql = $this->connection->prepare("DELETE FROM friends WHERE `user1` = ?  OR `user2` = ?")) {
            $sql->bind_param("dd", $userId, $userId);
            if ($sql->execute()) {
                return true;
            }
        } else {
            echo "Fehler bei deleteFriends: " . $this->connection->error . $this->connection->errno;
        }
    }

    public function deleteUser($userId)
    {
        $this->deleteFriends($userId);
        $sql = $this->connection->prepare("DELETE FROM `users` WHERE `id` = ?");
        $sql->bind_param("d", $userId);
        if ($sql->execute()) {
            return true;
        } else {
            return false;
        }
    }


    


    


    public function deleteFriendship($idArray)
    {
        $id1 = $idArray[0];
        $id2 = $idArray[1];

        if ($sql = $this->connection->prepare("DELETE FROM friends WHERE (`user1` = ? AND `user2` = ?) OR (`user2` = ? AND `user1` = ?)")) {
            $sql->bind_param("dddd", $id1, $id2, $id1, $id2);
            if ($sql->execute()) {
                return true;
            }
        } else {
            echo "Fehler bei deleteFriendship(): " . $this->connection->error . $this->connection->errno;
        }
    }


    

    public function getFriendRequestsSent($id)
    {            //GEHT
        if ($sql = $this->connection->prepare("SELECT `user2` FROM friends WHERE `user1` = ? AND status = ?")) {
            $status = "pending";
            $sql->bind_param("ds", $id, $status);
            if ($sql->execute()) {
                $sql->bind_result($friendId);
                while ($sql->fetch()) {
                    if (!empty($friendId)) {
                        $requestArray[] = $friendId;
                    }
                }
                if (isset($requestArray)) {
                    return $requestArray;
                } else {
                    return false;
                }
            }
        }
        echo "Fehler bei getFriendshipRequests(): " . $this->connection->error . $this->connection->errno;
    }

    //funktionierende Freunde-Funktionen die implementiert sind
    public function getFriends($id)
    {
        $status = "accepted";
        if ($sql = $this->connection->prepare("SELECT `user2` FROM friends WHERE `user1` = ? AND `status` = ?")) {
            $sql->bind_param("ds", $id, $status);
            if ($sql->execute()) {
                $sql->bind_result($friendId);
                while ($sql->fetch()) {
                    if (!empty($friendId)) {
                        $friendArray[] = $friendId;
                    }
                }
            }
        }
        $sql->free_result();

        if ($sql = $this->connection->prepare("SELECT `user1` FROM friends WHERE `user2` = ? AND `status` = ?")) {
            $sql->bind_param("ds", $id, $status);
            if ($sql->execute()) {
                $sql->bind_result($friendId);
                while ($sql->fetch()) {
                    if (!empty($friendId)) {
                        $friendArray[] = $friendId;
                    }
                }
            }
        }

        if (isset($friendArray)) {
            return $friendArray;
        } else {
            return false;
        }
    }

    public function getFriendRequests($id)
    {
        if ($sql = $this->connection->prepare("SELECT `user1` FROM friends WHERE `user2` = ? AND status = ?")) {
            $status = "pending";
            $sql->bind_param("ds", $id, $status);
            if ($sql->execute()) {
                $sql->bind_result($friendId);
                while ($sql->fetch()) {
                    if (!empty($friendId)) {
                        $requestArray[] = $friendId;
                    }
                }
                if (isset($requestArray)) {
                    return $requestArray;
                } else {
                    return false;
                }
            }
        }
        echo "Fehler bei getFriendshipRequests(): " . $this->connection->error . $this->connection->errno;
    }

    public function getUserByID($id)
    {
        $sql = $this->connection->prepare("SELECT * FROM users WHERE id = ?");
        $sql->bind_param("i", $id);
        if ($sql->execute()) {
            $sql->bind_result($id, $username, $email, $pwd, $role);
            $sql->fetch();
            $user[0] = $id;
            $user[1] = $username;
            $user[2] = $email;
            return $user;
        } else {
            echo "Fehler. User nicht ausgelesen.<br>";
            return null;
        }
    }

    public function searchUser($searchValue)
    {
        $sql = $this->connection->prepare("SELECT * FROM users WHERE username LIKE ?");
        $sql->bind_param("s", $searchValue);
        if ($sql->execute()) {
            $result = $sql->get_result();
            while ($row = $result->fetch_row()) {
                $user[0] =$row[0];
                $user[1] =$row[1];
                $user[2] =$row[2];

                $userArray[] = $user;
            }
            return $userArray;
        } else {
            echo "Fehler. User nicht gefunden.<br>";
            return null;
        }
    }

    public function acceptFriendRequest($idArray)
    {
        $ownId = $idArray[0];
        $friendId = $idArray[1];
        if ($sql = $this->connection->prepare("SELECT id FROM friends WHERE `user1` = ? AND `user2` = ? AND status = ?")) {
            $status = "pending";
            $sql->bind_param("dds", $friendId, $ownId, $status);
            if ($sql->execute()) {
                $sql->bind_result($result);
                $sql->fetch();
                if (!empty($result)) {                  //wenn ein gültiges ergbnis gefunden wurde -> status ändern auf accepted.
                    $sql->free_result();
                    if ($sql = $this->connection->prepare("UPDATE friends SET status = ? WHERE id = ?")) {
                        $status = "accepted";
                        $sql->bind_param("sd", $status, $result);
                        if ($sql->execute()) {
                            return true;
                        }
                    }
                }
            }
        } else {
            echo "Fehler bei acceptFriendRequest(): " . $this->connection->error . $this->connection->errno;
        }
        return false;
    }

    public function sendFriendRequest($idArray)
    {
        $id1 = $idArray[0];
        $id2 = $idArray[1];
        if ($sql = $this->connection->prepare("SELECT id FROM friends WHERE `user1` = ? AND `user2` = ? OR `user1` = ? AND `user2` = ?")) {
            $sql->bind_param("dddd", $id1, $id2, $id2, $id1);
            if ($sql->execute()) {
                $sql->bind_result($result);
                $sql->fetch();
                if (!empty($result)) {                  //wenn ein gültiges ergbnis gefunden wurde = Anfrage wurde schon geschickt. -> return false am ende
                    $sql->free_result();
                } else {
                    if ($sql = $this->connection->prepare("INSERT INTO friends (`user1`, `user2`) VALUES (?, ?)")) {
                        $sql->bind_param("dd", $id1, $id2);
                        if ($sql->execute()) {
                            return true;
                        }
                        echo "execute = false<br>";
                    } else {
                        echo "prepare is false: " . $this->connection->error . $this->connection->errno . "<br>";
                    }
                }
            }
        } else {
            echo "Fehler bei requestFriendship(): " . $this->connection->error . $this->connection->errno;
        }
        echo "false<br>";
        return false;
    }



    //CHAT FUNKTIONEN
    public function sendMsg($msgArray)
    {
        $senderId = $msgArray[0];
        $receiverId = $msgArray[1];
        $message = $msgArray[2];

        $sql = $this->connection->prepare("INSERT INTO messages (sender_id,receiver_id,message) VALUES (?,?,?)");
        $sql->bind_param("sss", $senderId, $receiverId, $message);
        if ($sql->execute()) {
            return true;
        } else {
            echo "Fehlermeldung: $sql->error.<br>";
            return false;
        }
    }

    public function getChatHistory($idArray)
    {
        $id1 = $idArray[0];
        $id2 = $idArray[1];


        if ($sql = $this->connection->prepare("SELECT * FROM messages WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)")) {
            $sql->bind_param("ssss", $id1, $id2, $id2, $id1);
            if ($sql->execute()) {
                $result = $sql->get_result();
                while ($row = $result->fetch_row()) {
                    $chat[0] = $row[1];
                    $chat[1] = $row[3];
                    $chatArray[] = $chat;
                }
                return $chatArray;
            }
        } else {
            echo "Fehlermeldung: $sql->error.<br>";
            return false;
        }
    }
}
