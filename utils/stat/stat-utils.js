StatUtils = {
    round_to_precision ($x, $p) {
        $x = $x * Math.pow(10, $p);
        $x = Math.round($x);
        return $x / Math.pow(10, $p);
    }
};