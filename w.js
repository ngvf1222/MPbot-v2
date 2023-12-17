a=[-2,0,2]
b=a[a.length-1]
c=a[0]
function do_it(x,y){
    return x.reduce((a,b,i)=>a+b*Math.pow(y,i))
}
b_r=[]
c_r=[]
for(let i=1;i<=b;i++){
    if(b%i==0){
        b_r[b_r.length]=i
    }
    if(b%(-i)==0){
        b_r[b_r.length]=-i
    }
}
for(let j=1;j<=c;j++){
    if(c%j==0){
        c_r[c_r.length]=j
    }
    if((-c)%j==0){
        c_r[c_r.length]=-j
    }
}
console.log(b_r,c_r,b,c)
s=[]
for(let i of b_r){
    for(let j of c_r){
        console.log([i,j,j/i,do_it(a,j/i)])
        if(do_it(a,j/i)==0){
            s[s.length]=j/i
        }
    }
}
console.log(s)