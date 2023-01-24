function init() {

    fetch('data.json').then(response => response.json()).then(

        data => {
            
            console.log(data);

            const skills = data.averages.map(d => d.skills);

            console.log(skills);

            skills_selected = [''];

            const controls = new Controls(skills);

            const chart = new Chart(data);

            console.log(chart.ref);

            const bubbles = data.main_data.map((datum, i) => {
                return new Bubble(datum, i, chart);
            });

            console.log(bubbles);


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

            skills_selected[0] = clicked_skill;

            console.log(skills_selected);

            bubbles.forEach(bubble => bubble.update_position(skills_selected))

        }



    }

}

class Bubble {

    datum;

    chart_ref;

    ref;

    constructor(datum, i, chart) {

        this.datum = datum;

        const svg = chart.ref;

        this.chart_ref = chart;

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', 0);
        circle.setAttribute('cy', 0);
        circle.classList.add('data-point');
        circle.dataset.id = i;

        this.ref = circle;

        console.log(datum, svg, circle);

        svg.appendChild(circle); 

    }

    update_position(skills) {

        const datum = this.datum;

        if (skills.length == 1) {

            const skill = skills[0];

            //console.log(this.chart_ref.x_hist(datum['rank_' + skill]));

            this.ref.setAttribute('transform', `translate(${this.chart_ref.x_hist(datum['rank_' + skill])},${this.chart_ref.y_hist(datum[skill])})`)


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