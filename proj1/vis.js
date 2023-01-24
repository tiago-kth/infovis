function init() {

    fetch('data.json').then(response => response.json()).then(

        data => {
            
            console.log(data);

            const skills = data.averages.map(d => d.skills);

            console.log(skills);

            const controls = new Controls(skills);

            const chart = new Chart(data);

        }
    )

}

init();

class Controls {

    ref = document.querySelector('.skills-container');

    constructor(skills) {

        const cont = this.ref;

        skills.forEach(skill => {

            const new_btn = document.createElement('button');
            new_btn.innerText = skill;
            new_btn.classList.add('skill-button');
            new_btn.dataset.name = skill;

            cont.appendChild(new_btn);

        })

        this.monitor();

    }

    monitor() {

        this.ref.addEventListener('click', this.on_click);

    }

    on_click(e) {

        if (e.target.tagName == 'BUTTON') {

            const clicked_btn = e.target;

            clicked_btn.classList.toggle('active');

            const clicked_skill = clicked_btn.dataset.name;

            console.log(`skill clicada: ${clicked_skill}`);

        }



    }

}

class Chart {

    w;
    h;

    margin = 20;

    x_hist;
    y_hist;

    data_params = {
        max_rank : null
    }



    ref = document.querySelector('.vis');

    cont = document.querySelector('.vis-container');

    constructor(data) {

        this.data_params.max_rank = data.max_rank;

        this.make_scales();

        console.log(this.w, this.h);
        console.log(this.x_hist(10));

    }

    get_sizes() {

        this.w = +window.getComputedStyle(this.cont).width.slice(0,-2);
        this.h = +window.getComputedStyle(this.cont).height.slice(0,-2);

    }

    make_scales() {

        this.get_sizes();

        this.x_hist = d3.scaleLinear().domain([0,this.data_params.max_rank]).range([this.margin, this.w / 2]);
        this.y_hist = d3.scaleLinear().domain([0,10]).range([this.h/2, this.margin]);

    }

}