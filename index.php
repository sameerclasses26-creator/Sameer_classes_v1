
<?php 


include 'admin/includes/config-2.php';
$query = "SELECT * FROM posts ORDER BY id desc";

include './assets/includes/header.php';
?>





    <main>

      <!--
        - #HOME SECTION
      -->

      <section class="home" id="home">

        <div class="deco-shape shape-1">
          <img src="./assets/images/shape-1.png" alt="art shape" width="70">
        </div>
        <div class="deco-shape shape-2">
          <img src="./assets/images/shape-2.png" alt="art shape" width="55">
        </div>
        <div class="deco-shape shape-3">
          <img src="./assets/images/shape-3.png" alt="art shape" width="120">
        </div>
        <div class="deco-shape shape-4">
          <img src="./assets/images/shape-4.png" alt="art shape" width="30">
        </div>

        <div class="home-left">

          <p class="section-subtitle" style="font-size: 40px;">Welcome To MER CLASSES</p>

          <h1 class="main-heading">
            Get Classes From Top
            <span class="underline-img">Instructor <img src="./assets/images/banner-line.png" alt="line"></span>
          </h1>

          <p class="section-text">
            MER COACHING is one of the premier coaching institutes of MOTIHARI, providing classroom coaching for JEE (Main), JEE (Advanced), and Early Lead foundation courses(Class V to X, XI - XII , TARGET ,NTSE & Olympiads). MER started its historic journey in the year 2019 and since its inception, it has aimed to produce top results in all Engineering entrance exams.
          </p>

          <div class="home-btn-group">
            <button class="btn btn-primary">
              <p class="btn-text">Explore Courses</p>
              <span class="square"></span>
            </button>

           <a href="login.php"> <button class="btn btn-secondary">
              <p class="btn-text">Login/Signup</p>
              <span class="square"></span>
            </button></a>
          </div>

        </div>

        <div class="home-right">

          <div class="img-box">

            
            <img src="./assets/images/home-pic.JPG" alt="banner image" class="banner-img" style="margin-bottom:50px">

           

          </div>

        </div>

      </section>
        <?php include 'assets/includes/marquee.php';?>

      <!-- Caraousel -->
      <!--Slider-->
     <!-- Slideshow container -->
<div class="slideshow-container">

  <!-- Full-width images with number and caption text -->
  <div class="mySlides fade">
    <div class="numbertext">1 / 3</div>
    <img src="./assets/images/banner-2.JPG" style="width:100%">
    
  </div>

  <div class="mySlides fade">
    <div class="numbertext">2 / 3</div>
    <img src="./assets/images/banner3.jpg" style="width:100%">
   
  </div>

  <div class="mySlides fade">
    <div class="numbertext">3 / 3</div>
    <img src="./assets/images/banner1.jpg" style="width:100%">
    
  </div>

  <!-- Next and previous buttons -->
  <a class="prev" onclick="plusSlides(-1)">&#10094;</a>
  <a class="next" onclick="plusSlides(1)">&#10095;</a>
</div>
<br>

<!-- The dots/circles -->
<div style="text-align:center">
  <span class="dot" onclick="currentSlide(1)"></span>
  <span class="dot" onclick="currentSlide(2)"></span>
  <span class="dot" onclick="currentSlide(3)"></span>
</div>



      <!--
        - #COURSE CATEGORY SECTION
      -->

      <section class="category" id="course">

        <p class="section-subtitle">Course Category</p>

        <h2 class="section-title">Some Courses</h2>

        <ul class="course-item-group">

          <li class="course-category-item">

            <div class="wrapper">
              <img src="./assets/images/course-category-icon-1.png" alt="category icon" class="category-icon default">

              <img src="./assets/images/course-category-icon-1-w.png" alt="category icon white"
                class="category-icon hover">
            </div>

            <div class="course-category-content">
              <h3 class="category-title">
                <a href="#">Pre-Foundation</a>
              </h3>

              <p class="category-subtitle">Class 6th to 10th</p>
            </div>

          </li>


          <li class="course-category-item">

            <div class="wrapper">
              <img src="./assets/images/course-category-icon-2.png" alt="category icon" class="category-icon default">

              <img src="./assets/images/course-category-icon-2-w.png" alt="category icon white"
                class="category-icon hover">
            </div>

            <div class="course-category-content">
              <h3 class="category-title">
                <a href="#">Foundation</a>
              </h3>

              <p class="category-subtitle">Class 11th & 12th</p>
            </div>

          </li>


          <li class="course-category-item">

            <div class="wrapper">
              <img src="./assets/images/course-category-icon-3.png" alt="category icon" class="category-icon default">

              <img src="./assets/images/course-category-icon-3-w.png" alt="category icon white"
                class="category-icon hover">
            </div>

            <div class="course-category-content">
              <h3 class="category-title">
                <a href="#">IIT-JEE</a>
              </h3>

              <p class="category-subtitle"></p>
            </div>

          </li>


          <li class="course-category-item">

            <div class="wrapper">
              <img src="./assets/images/course-category-icon-4.png" alt="category icon" class="category-icon default">

              <img src="./assets/images/course-category-icon-4-w.png" alt="category icon white"
                class="category-icon hover">
            </div>

            <div class="course-category-content">
              <h3 class="category-title">
                <a href="#">KVPY</a>
              </h3>

              <p class="category-subtitle"></p>
            </div>

          </li>


          <li class="course-category-item">

            <div class="wrapper">
              <img src="./assets/images/course-category-icon-5.png" alt="category icon" class="category-icon default">

              <img src="./assets/images/course-category-icon-5-w.png" alt="category icon white"
                class="category-icon hover">
            </div>

            <div class="course-category-content">
              <h3 class="category-title">
                <a href="#">NTSE</a>
              </h3>

              <p class="category-subtitle"></p>
            </div>

          </li>


          <li class="course-category-item">

            <div class="wrapper">
              <img src="./assets/images/course-category-icon-6.png" alt="category icon" class="category-icon default">

              <img src="./assets/images/course-category-icon-6-w.png" alt="category icon white"
                class="category-icon hover">
            </div>

            <div class="course-category-content">
              <h3 class="category-title">
                <a href="#">OLYMPIAD</a>
              </h3>

              <p class="category-subtitle"></p>
            </div>

          </li>

        </ul>

      </section>
 <!--
        - #Youtube Section
      -->

      <section class="about" id="about">

        <div class="about-left">

          <div class="img-box">
         <div class="video-responsive">
<iframe width="420" height="315" src="http://www.youtube.com/embed/VnTKKs9h2Rk" frameborder="0" allowfullscreen></iframe>
</div>

        
          </div>

        </div>

        <div class="about-right">

          <h1 class="section-title">MER CLASSES Youtube Channel</h1>

          <h2 class="section-subtitle">We are coming with Best online Studying facility.</h2>

         
          

          <a href="https://www.youtube.com/channel/UC1-kFlOe7RLt9YMTO0JaP4A?sub_confirmation=1"><button class="btn btn-primary">
            <p class="btn-text">Subscribe Our Channel</p>
            <span class="square"></span>
          </button></a>

        </div>

      </section>



            
                            <!-- Tab panes -->
                          
           
   


      <br>
      <br>

<style>
    a { color:white }
    {codecitation}.video-responsive{
overflow:hidden;
padding-bottom:56.25%;
position:relative;
height:0;
}
.video-responsive iframe{
left:0;
top:0;
height:100%;
width:100%;
position:absolute;
}{/codecitation}


  </style>


 <div class="notice">
 <h1  style="font-family: 'Oswald', sans-serif; text-align: center; color:black; ">Notice Panel</h1>
 <marquee width="100%" direction="up" scrollamount="2"  height="300px " style="text-align: center;">

  <?php 
if ($result = $mysqli->query($query)) {
while ($row = $result->fetch_assoc()) {
   
    $field1name = $row["post_title"];
    $field2name = $row["post_desc"];
    $field3name = $row["username"];
    $field4name = $row["created_date"];
  echo '
 



                        
                                                     
                                                      <div class="notice-data">
                                                        
                                                           <h2>' .$field2name.'</h2>
                                                           <span class="sl-date">'. date($field4name) .'</span>
                                                                    </div>
                                                                   
                                                                    ';}}?>
                                                
     
  
</marquee>
 
 </div>
 <style>
 .notice {
  max-width: 1500px;
  margin: auto;
  background-color: #FF5219;
  margin-bottom: 100px;
  color: white;
}
.notice-data{
   background-color: #FF5219;
}

 </style>


      <!--
        - #New Section
      -->
      <section class="about" id="about">

        <div class="about-left">

          <div class="img-box">
           
            <img src="./assets/images/invitation.png" alt="mer-banner" class="about-img" style="height:650px">

           
          </div>

        </div>

        <div class="about-right">

          <p class="section-subtitle">New Branch</p>

          <h2 class="section-title">SAMEER CLASSES</h2>

          <p class="section-text">
            A 2nd branch of MER Coaching Institute for the preparation of JEE (Main+Advanced), JEE (Main), Pre-Foundation(Class VIII to X) ,  Foundation (Class XI to XII) & NTSE & Olympiads). The Institute is well regarded for 
            the high quality entrance exams preparation and produces best results year after year. At Sameer Classes, we focus on building a strong foundation of knowledge and concepts in students for their success and provide an excellent platform 
            for the preparation of competitive exams and board level education. 

          <ul class="about-ul">

            <li>
              <ion-icon name="checkmark-circle"></ion-icon>
              <p>Pre-Foundation(Class VIII to X) </p>
            </li>

            <li>
              <ion-icon name="checkmark-circle"></ion-icon>
              <p>Foundation (Class XI to XII)</p>
            </li>

            <li>
              <ion-icon name="checkmark-circle"></ion-icon>
              <p>TARGET/IITJEE/NTSE/KVPY/OLYMPIAD</p>
            </li>

          </ul>

        

        </div>

      </section>

      <section class="about" id="about">

        <div class="about-left">

          <div class="img-box">
            <img src="./assets/images/about-img-bg.png" alt="about bg" class="about-bg">

            <img src="./assets/images/about-img.png" alt="about person" class="about-img">

            <img src="./assets/images/banner-aliment-icon-4.png" alt="" class="icon-1 smooth-zigzag-anim-1">
            <img src="" alt="" class="icon-2 smooth-zigzag-anim-3" width="195">
          </div>

        </div>

        <div class="about-right">

          <p class="section-subtitle">About Us</p>

          <h2 class="section-title">We Have Best Classroom Education</h2>

          <p class="section-text">
            A premier coaching institute for the preparation of JEE (Main+Advanced), JEE (Main+Advanced), JEE (Main), Pre-Foundation(Class VIII to X) ,  Foundation (Class XI to XII) & NTSE & Olympiads).The Institute is well regarded for 
            the high quality entrance exams preparation and produces best results year after year. At MER, we focus on building a strong foundation of knowledge and concepts in students for their success and provide an excellent platform 
            for the preparation of competitive exams and board level education. The best academic support and personal care which we provide to the students helps them meet their career goals and objectives.
          </p>

          <ul class="about-ul">

            <li>
              <ion-icon name="checkmark-circle"></ion-icon>
              <p>Pre-Foundation(Class VIII to X)</p>
            </li>

            <li>
              <ion-icon name="checkmark-circle"></ion-icon>
              <p>Foundation(Class XI to XII)</p>
            </li>

            <li>
              <ion-icon name="checkmark-circle"></ion-icon>
              <p>TARGET/IITJEE/NTSE/KVPY/OLYMPIAD</p>
            </li>

          </ul>

          <button class="btn btn-primary">
            <p class="btn-text">Explore More</p>
            <span class="square"></span>
          </button>

        </div>

      </section>
      <br>
      <br>
      <h1 style="text-align:center;font-size:50px"> Recent Images</h1>
      <br>
      
       <div class="marquee">
    <ul class="marquee-content">
      <li><img src="slider-images/1.jpeg" style="height:250px; width:450px"></li>
      <li> <img src="assets/images/campus_pic/smart-board1.jpg" style="height:250px; width:450px"></li>
      <li> <img src="assets/images/campus_pic/1.jpeg" style="height:250px; width:450px"></li>
      <li><img src="assets/images/campus_pic/2.jpeg" style="height:250px; width:450px"></li></li>
      <li><img src="assets/images/campus_pic/3.jpeg" style="height:250px; width:450px"></li></li>
      <li><img src="assets/images/campus_pic/4.jpeg" style="height:250px; width:450px"></li></li>
      <li><img src="assets/images/campus_pic/5.png" style="height:250px; width:450px"></li></li>
        <li> <img src="assets/images/saraswatipuja2023/1.jpeg" style="height:250px; width:450px"></li></li>
         
            <li> <img src="assets/images/saraswatipuja2023/3.jpeg" style="height:250px; width:450px"></li></li>
             <li> <img src="assets/images/saraswatipuja2023/4.jpeg" style="height:250px; width:450px"></li></li>
             <li> <img src="assets/images/saraswatipuja2023/5.jpeg" style="height:250px; width:450px"></li></li>
             

     
    </ul>
  </div>
  <br>
  <br>
  <br>
  <br>
  <style>

body {
  font-family: "Montserrat", sans-serif;
  background-color: #eee;
  color: #111;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

:root {
  --marquee-width: 80vw;
  --marquee-height: 30vh;
  /* --marquee-elements: 12; */ /* defined with JavaScript */
  --marquee-elements-displayed: 5;
  --marquee-element-width: calc(
    var(--marquee-width) / var(--marquee-elements-displayed)
  );
  --marquee-animation-duration: calc(var(--marquee-elements) * 3s);
}

.marquee {
  width: var(--marquee-width);
  height: var(--marquee-height);
  background-color: #111;
  color: #eee;
  overflow: hidden;
  position: relative;
}
.marquee:before,
.marquee:after {
  position: absolute;
  top: 0;
  width: 10rem;
  height: 100%;
  content: "";
  z-index: 1;
}
.marquee:before {
  left: 0;
  background: linear-gradient(to right, #111 0%, transparent 100%);
}
.marquee:after {
  right: 0;
  background: linear-gradient(to left, #111 0%, transparent 100%);
}
.marquee-content {
  list-style: none;
  height: 100%;
  display: flex;
  animation: scrolling var(--marquee-animation-duration) linear infinite;
}
/* .marquee-content:hover {
  animation-play-state: paused;
} */
@keyframes scrolling {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(
      calc(-1 * var(--marquee-element-width) * var(--marquee-elements))
    );
  }
}
.marquee-content li {
  display: flex;
  justify-content: center;
  align-items: center;
  /* text-align: center; */
  flex-shrink: 0;
  width: var(--marquee-element-width);
  max-height: 100%;
  font-size: calc(var(--marquee-height) * 3 / 4); /* 5rem; */
  white-space: nowrap;
}

.marquee-content li img {
  
  border: 15px solid #eee;
  padding-right:100px;
  width:450px;
}

@media (max-width: 600px) {
  html {
    font-size: 12px;
  }
  :root {
    --marquee-width: 100vw;
    --marquee-height: 16vh;
    --marquee-elements-displayed: 3;
  }
  .marquee:before,
  .marquee:after {
    width: 5rem;
  }
}

</style>
<script>
const root = document.documentElement;
const marqueeElementsDisplayed = getComputedStyle(root).getPropertyValue(
  "--marquee-elements-displayed"
);
const marqueeContent = document.querySelector("ul.marquee-content");

root.style.setProperty("--marquee-elements", marqueeContent.children.length);

for (let i = 0; i < marqueeElementsDisplayed; i++) {
  marqueeContent.appendChild(marqueeContent.children[i].cloneNode(true));
}

</script>



      <!--
        - #COURSE SECTION
      -->

      <!-- <section class="course" id="course">

        <p class="section-subtitle">Our Online Courses</p>

        <h2 class="section-title">Find The Right Online Course For You</h2>

        <div class="course-grid">

          <div class="course-card">

            <div class="course-banner">
              <img src="./assets/images/course-1.jpg" alt="course banner">

              <div class="course-tag-box">
                <a href="#" class="badge-tag orange">Business</a>
                <a href="#" class="badge-tag blue">Marketing</a>
              </div>
            </div>

            <div class="course-content">

              <h3 class="card-title">
                <a href="#">Become product manager learn skills.</a>
              </h3>

              <div class="wrapper border-bottom">

                <div class="author">
                  <img src="./assets/images/course-instructor-img.jpg" alt="course instructor image" class="author-img">

                  <a href="#" class="author-name">Lillian Wals</a>
                </div>

                <div class="rating">
                  <ion-icon name="star"></ion-icon>
                  <p>5.0 (2k)</p>
                </div>

              </div>

              <div class="wrapper">
                <div class="course-price">$50.00</div>

                <div class="enrolled">
                  <div class="icon-user">
                    <img src="./assets/images/student-icon.png" alt="user icon">
                  </div>

                  <p>600k</p>
                </div>
              </div>

            </div>

          </div>


          <div class="course-card">

            <div class="course-banner">
              <img src="./assets/images/course-2.jpg" alt="course banner">

              <div class="course-tag-box">
                <a href="#" class="badge-tag orange">Business</a>
                <a href="#" class="badge-tag blue">Marketing</a>
              </div>
            </div>

            <div class="course-content">

              <h3 class="card-title">
                <a href="#">Fashion and luxury fashion in a changing.</a>
              </h3>

              <div class="wrapper border-bottom">

                <div class="author">
                  <img src="./assets/images/course-instructor-img.jpg" alt="course instructor image" class="author-img">

                  <a href="#" class="author-name">Lillian Wals</a>
                </div>

                <div class="rating">
                  <ion-icon name="star"></ion-icon>
                  <p>4.7 (5k)</p>
                </div>

              </div>

              <div class="wrapper">
                <div class="course-price">$80.00</div>

                <div class="enrolled">
                  <div class="icon-user">
                    <img src="./assets/images/student-icon.png" alt="user icon">
                  </div>

                  <p>545k</p>
                </div>
              </div>

            </div>

          </div>


          <div class="course-card">

            <div class="course-banner">
              <img src="./assets/images/course-3.jpg" alt="course banner">

              <div class="course-tag-box">
                <a href="#" class="badge-tag orange">Business</a>
                <a href="#" class="badge-tag blue">Marketing</a>
              </div>
            </div>

            <div class="course-content">

              <h3 class="card-title">
                <a href="#">Learning to write as a professional.</a>
              </h3>

              <div class="wrapper border-bottom">

                <div class="author">
                  <img src="./assets/images/course-instructor-img.jpg" alt="course instructor image" class="author-img">

                  <a href="#" class="author-name">Lillian Wals</a>
                </div>

                <div class="rating">
                  <ion-icon name="star"></ion-icon>
                  <p>4.1 (3k)</p>
                </div>

              </div>

              <div class="wrapper">
                <div class="course-price">$29.90</div>

                <div class="enrolled">
                  <div class="icon-user">
                    <img src="./assets/images/student-icon.png" alt="user icon">
                  </div>

                  <p>317k</p>
                </div>
              </div>

            </div>

          </div>


          <div class="course-card">

            <div class="course-banner">
              <img src="./assets/images/course-4.jpg" alt="course banner">

              <div class="course-tag-box">
                <a href="#" class="badge-tag orange">Business</a>
                <a href="#" class="badge-tag blue">Marketing</a>
              </div>
            </div>

            <div class="course-content">

              <h3 class="card-title">
                <a href="#">Improving accessibility of Your markdown.</a>
              </h3>

              <div class="wrapper border-bottom">

                <div class="author">
                  <img src="./assets/images/course-instructor-img.jpg" alt="course instructor image" class="author-img">

                  <a href="#" class="author-name">Lillian Wals</a>
                </div>

                <div class="rating">
                  <ion-icon name="star"></ion-icon>
                  <p>4.8 (3.9k)</p>
                </div>

              </div>

              <div class="wrapper">
                <div class="course-price">$49.90</div>

                <div class="enrolled">
                  <div class="icon-user">
                    <img src="./assets/images/student-icon.png" alt="user icon">
                  </div>

                  <p>891k</p>
                </div>
              </div>

            </div>

          </div>



          <div class="course-card">

            <div class="course-banner">
              <img src="./assets/images/course-5.jpg" alt="course banner">

              <div class="course-tag-box">
                <a href="#" class="badge-tag orange">Business</a>
                <a href="#" class="badge-tag blue">Marketing</a>
              </div>
            </div>

            <div class="course-content">

              <h3 class="card-title">
                <a href="#">Master query in a short period of time.</a>
              </h3>

              <div class="wrapper border-bottom">

                <div class="author">
                  <img src="./assets/images/course-instructor-img.jpg" alt="course instructor image" class="author-img">

                  <a href="#" class="author-name">Lillian Wals</a>
                </div>

                <div class="rating">
                  <ion-icon name="star"></ion-icon>
                  <p>3.8 (1k)</p>
                </div>

              </div>

              <div class="wrapper">
                <div class="course-price">$89.00</div>

                <div class="enrolled">
                  <div class="icon-user">
                    <img src="./assets/images/student-icon.png" alt="user icon">
                  </div>

                  <p>204k</p>
                </div>
              </div>

            </div>

          </div>


          <div class="course-card">

            <div class="course-banner">
              <img src="./assets/images/course-6.jpg" alt="course banner">

              <div class="course-tag-box">
                <a href="#" class="badge-tag orange">Business</a>
                <a href="#" class="badge-tag blue">Marketing</a>
              </div>
            </div>

            <div class="course-content">

              <h3 class="card-title">
                <a href="#">Business Intelligence analyst Course 2022.</a>
              </h3>

              <div class="wrapper border-bottom">

                <div class="author">
                  <img src="./assets/images/course-instructor-img.jpg" alt="course instructor image" class="author-img">

                  <a href="#" class="author-name">Lillian Wals</a>
                </div>

                <div class="rating">
                  <ion-icon name="star"></ion-icon>
                  <p>4.9 (23k)</p>
                </div>

              </div>

              <div class="wrapper">
                <div class="course-price">$199.00</div>

                <div class="enrolled">
                  <div class="icon-user">
                    <img src="./assets/images/student-icon.png" alt="user icon">
                  </div>

                  <p>1.3M</p>
                </div>
              </div>

            </div>

          </div>

        </div>

        <button class="btn btn-primary">
          <p class="btn-text">View All Course</p>
          <span class="square"></span>
        </button>

      </section>




    -->
      <!--
        - #EVENT SECTION
      -->

      <!-- <section class="event">

        <div class="event-left"> -->

          <!-- <div class="event-banner">
            <img src="./assets/images/event-img.jpg" alt="event banner" class="banner-img">
          </div>

          <button class="play smooth-zigzag-anim-1">
            <div class="play-icon pulse-anim">
              <ion-icon name="play-circle"></ion-icon>
            </div>

            <p>Watch Us !</p>
          </button>

        </div> -->

        <!-- <div class="event-right">

          <p class="section-subtitle">Our Events</p>

          <h2 class="section-title">Join Our Upcoming Events</h2>

          <div class="event-card-group">

            <div class="event-card">

              <div class="content-left">
                <p class="day">28</p>
                <p class="month">Feb, 2022</p>
              </div>

              <div class="content-right">
                <div class="schedule">
                  <p class="time">10:30am To 2:30pm</p>
                  <p class="place">Poland</p>
                </div>

                <a href="#" class="event-name">Business creativity workshops</a>
              </div>

            </div>

            <div class="event-card">

              <div class="content-left">
                <p class="day">15</p>
                <p class="month">Mar, 2022</p>
              </div>

              <div class="content-right">
                <div class="schedule">
                  <p class="time">10:30am To 2:30pm</p>
                  <p class="place">Poland</p>
                </div>

                <a href="#" class="event-name">Street Performance: Call for Art.</a>
              </div>

            </div>

            <div class="event-card">

              <div class="content-left">
                <p class="day">20</p>
                <p class="month">May, 2022</p>
              </div>

              <div class="content-right">
                <div class="schedule">
                  <p class="time">10:30am To 2:30pm</p>
                  <p class="place">Poland</p>
                </div>

                <a href="#" class="event-name">Digital transformation conference</a>
              </div>

            </div>

          </div>

        </div>

      </section>  -->





      <!--
        - #FEATURES SECTION
      -->

      <section class="features">

        <div class="features-left">

          <p class="section-subtitle " style="font-size: 50px;">Why MER?</p>

          <h2 class="section-title">See What We Provide to Students</h2>

          <ul>

            <li class="features-item">
              <div class="item-icon-box blue">
                <img src="./assets/images/feature-icon-1.png" alt="feature icon">
              </div>

              <div class="wrapper">

                <h3 class="item-title">Doubt Solving Classes</h3>

                <p class="item-text"></p>

              </div>
            </li>

            <li class="features-item">
              <div class="item-icon-box pink">
                <img src="./assets/images/feature-icon-2.png" alt="feature icon">
              </div>

              <div class="wrapper">

                <h3 class="item-title">Regular Tests</h3>

                <p class="item-text"></p>

              </div>
            </li>

            <li class="features-item">
              <div class="item-icon-box purple">
                <img src="./assets/images/feature-icon-3.png" alt="feature icon">
              </div>

              <div class="wrapper">

                <h3 class="item-title">Hostel Program(Coming Soon)</h3>

                <p class="item-text"></p>

              </div>
            </li>

          </ul>

        </div>

        <div class="features-right">
          <img src="./assets/images/coure-features-img.jpg" alt="core features image">
        </div>

      </section>





      <!--
        - #INSTRUCTOR SECTION
      -->

      <section class="instructor" id="instructor">

        <p class="section-subtitle">Our Faculty</p>

        <h2 class="section-title">Our Expert Members</h2>

        <div class="instructor-grid">

          <div class="instructor-card">

            <div class="instructor-img-box" >
              <img src="./assets/images/sameer.jpg" alt="instructor louis sullivan">

              <div class="social-link">
                <a href="#" class="facebook">
                  <ion-icon name="logo-facebook"></ion-icon>
                </a>

                <a href="#" class="instagram">
                  <ion-icon name="logo-instagram"></ion-icon>
                </a>

                <a href="#" class="twitter">
                  <ion-icon name="logo-twitter"></ion-icon>
                </a>
              </div>
            </div>

            <h4 class="instructor-name">Sameer Prakash</h4>

            <p class="instructor-title">Teacher</p>

          </div>

          <div class="instructor-card">

            <div class="instructor-img-box">
              <img src="./assets/images/anurag.jpeg" alt="instructor camden david">

              <div class="social-link">
                <a href="#" class="facebook">
                  <ion-icon name="logo-facebook"></ion-icon>
                </a>

                <a href="#" class="instagram">
                  <ion-icon name="logo-instagram"></ion-icon>
                </a>

                <a href="#" class="twitter">
                  <ion-icon name="logo-twitter"></ion-icon>
                </a>
              </div>
            </div>

            <h4 class="instructor-name">Anurag Kumar</h4>

            <p class="instructor-title">Teacher</p>

          </div>

          <div class="instructor-card">

            <div class="instructor-img-box">
              <img src="anshu.jpg" alt="instructor fiona dean">

              <div class="social-link">
                <a href="#" class="facebook">
                  <ion-icon name="logo-facebook"></ion-icon>
                </a>

                <a href="#" class="instagram">
                  <ion-icon name="logo-instagram"></ion-icon>
                </a>

                <a href="#" class="twitter">
                  <ion-icon name="logo-twitter"></ion-icon>
                </a>
              </div>
            </div>

            <h4 class="instructor-name">Anshu Raj</h4>

            <p class="instructor-title">Web Developer</p>

          </div>

          <div class="instructor-card">

            <div class="instructor-img-box"  >
              <img src="./assets/images/rishav.jpg" alt="instructor cherish sosa">

              <div class="social-link">
                <a href="#" class="facebook">
                  <ion-icon name="logo-facebook"></ion-icon>
                </a>

                <a href="#" class="instagram">
                  <ion-icon name="logo-instagram"></ion-icon>
                </a>

                <a href="#" class="twitter">
                  <ion-icon name="logo-twitter"></ion-icon>
                </a>
              </div>
            </div>

            <h4 class="instructor-name">Rishav Kumar</h4>

            <p class="instructor-title">Web Developer</p>

          </div>

        </div>

      </section>
        <br>
      <br>






      <!--
        - #TESTIMONIALS
      -->

      <!-- <section class="testimonials">

        <div class="testimonials-left">

          <p class="section-subtitle">Testimonial</p>

          <h2 class="section-title">What Our Client Says About Us</h2>

          <p class="section-text">
            Proin et lacus eu odio tempor porttitor id vel augue. Vivamus volutpat vehicula sem, et imperdiet enim
            tempor id.
            Phasellus lobortis efficitur nisl eget vehicula. Donec viverra blandit nunc, nec tempor ligula ullamcorper
            venenatis.
          </p>

        </div>

        <div class="testimonials-right">

          <div class="testimonials-card">
            <img src="./assets/images/quote.png" alt="quote icon" class="quote-img">

            <p class="testimonials-text">
              "Proin feugiat tortor non neque eleifend, at fermentum est elementum. Ut mollis leo odio vulputate rutrum.
              Nunc sagittis
              sit amet ligula ut eleifend. Mauris consequat mauris sit amet turpis commodo fermentum. Quisque consequat
              tortor ut nisl
              finibus".
            </p>

            <div class="testimonials-client">

              <div class="client-img-box">
                <img src="./assets/images/client.jpg" alt="client christine rose">
              </div>

              <div class="client-detail">
                <h4 class="client-name">Christine Rose</h4>

                <p class="client-title">Customer</p>
              </div>

            </div>
          </div>

        </div>

      </section>
 -->




      <!--
        - #BLOG
      -->

      <!-- <section class="blog" id="blog">

        <p class="section-subtitle">Our Blog</p>

        <h2 class="section-title">Latest Blog & News</h2>

        <div class="blog-grid">

          <div class="blog-card">

            <div class="blog-banner-box">
              <img src="./assets/images/blog-1.jpg" alt="blog banner">
            </div>

            <div class="blog-content">

              <h3 class="blog-title">
                <a href="#">Proin feugiat tortor non neque eleifend.</a>
              </h3>

              <div class="wrapper">

                <div class="blog-publish-date">
                  <img src="./assets/images/calendar.png" alt="calendar icon">

                  <a href="#">07 Jan, 2022</a>
                </div>

                <div class="blog-comment">
                  <img src="./assets/images/comment.png" alt="comment icon">

                  <a href="#">3 Comments</a>
                </div>

              </div>

            </div>

          </div>

          <div class="blog-card">

            <div class="blog-banner-box">
              <img src="./assets/images/blog-2.jpg" alt="blog banner">
            </div>

            <div class="blog-content">

              <h3 class="blog-title">
                <a href="#">Proin feugiat tortor non neque eleifend.</a>
              </h3>

              <div class="wrapper">

                <div class="blog-publish-date">
                  <img src="./assets/images/calendar.png" alt="calendar icon">

                  <a href="#">04 Jan, 2022</a>
                </div>

                <div class="blog-comment">
                  <img src="./assets/images/comment.png" alt="comment icon">

                  <a href="#">10 Comments</a>
                </div>

              </div>

            </div>

          </div>

          <div class="blog-card">

            <div class="blog-banner-box">
              <img src="./assets/images/blog-3.jpg" alt="blog banner">
            </div>

            <div class="blog-content">

              <h3 class="blog-title">
                <a href="#">Proin feugiat tortor non neque eleifend.</a>
              </h3>

              <div class="wrapper">

                <div class="blog-publish-date">
                  <img src="./assets/images/calendar.png" alt="calendar icon">

                  <a href="#">01 Jan, 2022</a>
                </div>

                <div class="blog-comment">
                  <img src="./assets/images/comment.png" alt="comment icon">

                  <a href="#">5 Comments</a>
                </div>

              </div>

            </div>

          </div>

        </div>

      </section> -->





      <!--
        - #CONTACT
      -->

      <section class="contact">

        <div class="contact-card" id="contact">
          <img src="./assets/images/cta-bg-img.png" alt="shape" class="contact-card-bg">

          <h2>Start Your Coaching Classes With Us </h2>

          <button class="btn btn-primary ">
            <p class="btn-text"><a href="contactus.php" style="color: white;">Contact Us</p></a>
            <span class="square"></span>
          </button>
        </div>

      </section>

    </main>





   <?php include './assets/includes/footer.php';?>