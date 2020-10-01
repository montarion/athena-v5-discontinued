*{
    background-color:#212936;
    color: white;
    padding: 0;
    margin: 0;
    font-family: 'Roboto', sans-serif;
    border-radius:10px;
}

.sidebar{
    width: 200px;
    height: 100%;
    position: fixed;
}

#toptext{
    grid-area: toptext;
    margin: 20px;
}

#bottomtext{ 
    grid-area: bottomtext;
    margin: 0px 20px 20px 0;
}

#topimage{
    grid-area: topimage;
    margin: 20px 20px 20px 0;
}

#bottomimage{
    grid-area: bottomimage;
    margin: 0px 20px 20px 20px;
}


.maincontent{
    margin-left: 200px;
    height: 100vh;
    background-color:#2B3648;
    display: flex;
    justify-content: space-evenly;
    
    flex-grow: 1;
}

.flexhalf{
    display: flex;
    flex-grow: 1;
    width: 20%;
    flex-direction: column;
    flex-basis: auto;
}

.text{
    font-style: italic;
    font-weight: 300;
    text-align: center;
    vertical-align: middle;
    display: flex;
    justify-content: center;
    align-items: center;
}

.card{
    background-color:#212936;
    border-radius: 4px;
    min-height: 25%;
    min-width: 300px;
}

.image-image{
    display:flex;
    justify-content: center;
    align-items:center;
}

.image.card{
    position:relative;
}
.image-info{
    background: linear-gradient(0deg, rgba(41,45,52,1) 0%, rgba(41,45,52,0) 100%);
    position: absolute;
    bottom: 0px;
    height: 20%;
    width: 100%;
    display: grid;
    grid-template-areas:
        "info-icon info-text info-text info-text";

    z-index: 1;
    border-radius: 10px;
}

.image-info > .image{
    grid-area: info-icon;
    background-color: unset;
}

.image-info > .text{
    grid-area: info-text;
    background-color: unset;
}

#toptext{
    font-size: large;
}


/*
.image{
    display:grid;
    grid-template-columns: auto;
    grid-template-rows:auto;

    
}
*/
img{
    padding:0;
    margin:0;
    border-radius: 10px;
}
