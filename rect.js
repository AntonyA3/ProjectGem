function Rect(x,y,w,h){
    this.x = x || 0;
    this.y = y || 0;
    this.w = w || 0; 
    this.h = h || 0;

}

function rectContainsPoint(rect, point){
    if (point[0] < rect.x || point[0] > (rect.x + rect.w)) return false;
    if (point[1] < rect.y || point[1] > (rect.y + rect.h)) return false;
    return true;
}
