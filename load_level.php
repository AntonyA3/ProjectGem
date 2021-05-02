<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");


$levelName = $_GET["q"];
$data = file_get_contents("./levels/{$levelName}");

echo $data;