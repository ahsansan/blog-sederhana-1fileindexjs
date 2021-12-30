let blogs = []

function addBlog(event){
    event.preventDefault()

    let title = document.getElementById('input-blog-title').value
    let content = document.getElementById('input-blog-content').value
    let images = document.getElementById('input-blog-image').files

    image = URL.createObjectURL(images[0])

    let blog = {
        title: title,
        content: content,
        image: image,
        author: 'Maulana Ahsan',
        postAt: new Date()
    }

    blogs.push(blog)

    manipulationHTML()
}

function manipulationHTML(){
    let contentContainer = document.getElementById('contents');

    contentContainer.innerHTML = ''

    for( let i = 0; i < blogs.length; i++ ) {
        contentContainer.innerHTML += `
                                            <div class="blog-list-item">
                                            <div class="blog-image">
                                            <img src="${blogs[i].image}" alt="" />
                                            </div>
                                            <div class="blog-content">
                                            <div class="btn-group">
                                                <button class="btn-edit">Edit Post</button>
                                                <button class="btn-post">Post Blog</button>
                                            </div>
                                            <h1>
                                                <a href="blog-detail" target="_blank"
                                                >${blogs[i].title}</a
                                                >
                                            </h1>
                                            <div class="detail-blog-content">
                                                ${getFullTime(blogs[i].postAt)} | ${blogs[i].author}
                                            </div>
                                            <p>
                                                ${blogs[i].content}
                                            </p>
                                            <div style="text-align: right; font-size: 13px; color: grey; font-style: italic;">
                                              ${getDistanceTime(blogs[i].postAt)}
                                            </div>
                                            </div>
                                        </div>
        
                                    `
    }
}

let month = [ 
                'January', 
                'February', 
                'March', 
                'April', 
                'May', 
                'June', 
                'July', 
                'August', 
                'September', 
                'October', 
                'November', 
                'December'
            ]

function getFullTime(time) {

    let date = time.getDate()
    let monthIndex = time.getMonth()
    let year = time.getFullYear()

    let hours = time.getHours()
    let minutes = time.getMinutes()

    let result = `${date} ${month[monthIndex]} ${year} ${hours}:${minutes} WIB`

    return result
}

function getDistanceTime(time) {

    let timePost = time
    let timeNow = new Date()

    let distance = timeNow - timePost

    let milisecond = 1000;
    let secondInMinutes = 60;
    let minutesInHour = 60;
    let hourInDay = 23;

    let distanceDay = Math.floor(distance / (milisecond * secondInMinutes * minutesInHour * hourInDay))
    let distanceHour = Math.floor(distance / (milisecond * secondInMinutes * minutesInHour))
    let distanceMinutes = Math.floor(distance / (milisecond * secondInMinutes))
    let distanceSecond = Math.floor(distance / milisecond)

    if ( distanceDay >= 1) {
    return `${distanceDay} day ago` }

    else if ( distanceHour >= 1) {
    return `${distanceHour} hours ago` }

    else  if ( distanceMinutes >= 1) {
    return `${distanceMinutes} minutes ago` }

    else {
        return `${distanceSecond} second ago` }
}

setInterval(()=>{
    manipulationHTML()
},1000)