<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

$json = file_get_contents('php://input');

$myfile = fopen("levels/test_level2.json", "w");
fwrite($myfile, $json);
fclose($myfile);
echo $json;