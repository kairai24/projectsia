<?php
$host = "localhost"; 
$user = "root"; 
$pass = ""; // your MySQL password
$db = "nexus_gadgets";

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
