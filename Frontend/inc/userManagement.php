<?php
include_once "../Backend/db/dataHandler.php";
$db = new dataHandler();
$userArray = $db->getAllUsers();

if(isset($_POST['delete'])){
    $db->deleteUser($_POST['delete']);
}

?>

    <div class="pt-2 welcomeHome mt-3">
        <div class="text-center">
            <h1>Usermanagement</h1>

        </div>
        <table class="table table-striped">
            <thead class="thead-light">
            <tr>
                <th scope="col">ID</th>
                <th scope="col">Username</th>
                <th scope="col">E-Mail</th>
                <th scope="col">Role</th>
                <th scope="col">Action</th>   
            </tr>
            </thead>
            <tbody>
            <?php
            foreach ($userArray as $user) {

                echo "<tr>";
                echo "<th scope='row'>" . $user->getID() . "</th>";
                echo "<td>" . $user->getUsername() . "</td>";
                echo "<td>" . $user->getEmail() . "</td>";
                echo "<td>" . $user->getRole() . "</td>";
                echo "<td><button type='button' onclick= 'deleteUser(". $user->getID() .")'name='delete' class='btn btn-primary' value='" . $user->getID() . "'>Delete</button></td>";
            }
            echo "</tbody></table>";
            ?>


    </div>
   