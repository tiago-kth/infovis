function init() {

    fetch('data.json').then(response => response.json()).then(

        data => {
            
            console.log(data);

            const skills = data.averages.map(d => d.skills);

            console.log(skills);

            skills_selected = [''];

            

            const chart = new Chart(data);
            const bubbles = new Bubbles(chart, data.main_data);
            const controls = new Controls(skills, bubbles);

            console.log(chart.ref);

            /*
            const bubbles = data.main_data.map((datum, i) => {
                return new Bubble(datum, i, chart);
            });
            */

            // const bubbles = d3.select('.vis').selectAll('circle').data(data.main_data).join('circle')
            //   .classed('data-point', true)
            //   .attr('data-id', (d,i) => i)
            //   .attr('cx', 0)
            //   .attr('cy', 0)
            // ;



            console.log(bubbles);


        }
    )

}

init();

class Controls {

    ref = document.querySelector('.skills-container');

    bubbles;

    chart;

    constructor(skills, bubbles) {

        const cont = this.ref;
        this.bubbles = bubbles;
        this.chart = bubbles.chart_ref;

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

        this.ref.addEventListener('click', e => this.on_click(e, this.bubbles));

    }

    on_click(e, bubbles) {

        console.log(bubbles);

        if (e.target.tagName == 'BUTTON') {

            const clicked_btn = e.target;

            clicked_btn.classList.toggle('active');

            const clicked_skill = clicked_btn.dataset.name;

            console.log(`skill clicada: ${clicked_skill}`);

            skills_selected[0] = clicked_skill;

            console.log(skills_selected);

            bubbles.move_bubbles(skills_selected);

        }



    }

}

/*
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

}*/

class Bubbles {

    ref;
    chart_ref;

    constructor(chart, data) {

        this.ref = d3.select('.vis').selectAll('circle').data(data).join('circle')
              .classed('data-point', true)
              .attr('data-id', (d,i) => i)
              .attr('cx', 0)
              .attr('cy', 0)
              .attr('r', chart.r)
            ;

        this.chart_ref = chart;

    }

    move_bubbles(skills) {

        if (skills.length == 1) {

            const skill = skills[0];

            this.ref
            .attr('transform', d => `translate(
                ${this.chart_ref.x_hist(d['rank_' + skill])},
                ${this.chart_ref.y_hist(d[skill])})`
            )

        }
        
    }



}

class Chart {

    w;
    h;

    r = 10;

    margin = 20;
    gap = 2;

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

        this.x_hist = d3.scaleLinear().domain([0,this.data_params.max_rank]).range([this.margin, this.data_params.max_rank * this.r * 2 + (this.data_params.max_rank - 1) * this.gap]);
        this.y_hist = d3.scaleLinear().domain([1,10]).range([10 * this.r * 2 + 9 * this.gap, this.margin]);

    }

}