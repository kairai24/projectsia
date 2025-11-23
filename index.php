<?php
include "connection.php";

$result = $conn->query("SELECT * FROM products");

while($row = $result->fetch_assoc()) {
    echo $row["name"] . " - ₱" . $row["price"] . "<br>";
}
?>
