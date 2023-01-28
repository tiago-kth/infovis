function init() {

    fetch('data.json')
      .then(response => response.json())
      .then(

        data => {
            
            console.log(data);

            const skills = data.averages.map(d => d.skills);

            console.log(skills);

            const chart = new Chart(data);
            const bubbles = new Bubbles(chart, data.main_data);
            const controls = new Controls(skills, bubbles);

            console.log(chart, chart.x_hist.range(), chart.y_hist.range());

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
    ref_radio = document.querySelector('.control-type');

    selection_type = 'one';

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

        this.ref.addEventListener('click', e => this.on_click(e, this.bubbles, this.selection_type, this.ref));
        this.ref_radio.addEventListener('change', this.radio_change);

    }

    on_click(e, bubbles, selection_type, skillsContainer) {

        console.log(bubbles, selection_type, skillsContainer);

        if (e.target.tagName == 'BUTTON') {

            const clicked_btn = e.target;

            const clicked_skill = clicked_btn.dataset.name;

            console.log(`skill clicada: ${clicked_skill}`);

            if (selection_type == 'one') {

                Array.from(skillsContainer.children).forEach(skill_btn => skill_btn.classList.remove('active'));
                clicked_btn.classList.toggle('active');

                bubbles.skills_selected = [] 
                bubbles.skills_selected[0] = clicked_skill;

                bubbles.chart_ref.show_axis( bubbles.chart_ref.y_axis);

            }

            console.log(bubbles.skills_selected);

            bubbles.move_bubbles(bubbles.skills_selected);

        }



    }

    radio_change(e) {

        this.selection_type = e.target.value;

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

    skills_selected = [];

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

    margin = 30;
    gap = 1;

    axis = [

        {
            y_hist : null
        },

    ]

    // scales
    y_hist;
    x_hist;
    x_scatter;
    y;
    x_pc;

    data_params = {
        max_rank : null
    }

    x_axis;
    y_axis;

    ref = document.querySelector('.vis');

    svg = d3.select('.vis');

    cont = document.querySelector('.vis-container');

    constructor(data) {

        this.data_params.max_rank = data.max_rank;

        this.make_scales();
        this.make_axis();

        console.log(this.w, this.h);
        console.log(this.x_hist(10));


    }

    get_sizes() {

        this.w = +window.getComputedStyle(this.ref).width.slice(0,-2);
        this.h = +window.getComputedStyle(this.cont).height.slice(0,-2);

        this.ref.setAttribute('viewBox', `0 0 ${this.w} ${this.h}`);

    }

    make_scales() {

        this.get_sizes();

        this.x_hist = d3.scaleLinear().domain([0,this.data_params.max_rank]).range([this.margin, this.margin + (this.data_params.max_rank) * this.r * 2 + (this.data_params.max_rank) * this.gap]);
        this.y_hist = d3.scaleLinear().domain([1,10]).range([9 * this.r * 2 + 9 * this.gap + this.margin, this.margin]);
        this.x_scatter = d3.scaleLinear().domain([1,10]).range([this.margin, this.w - this.margin]);
        this.y = d3.scaleLinear().domain([1,10]).range([this.h - this.margin, this.margin])

    }

    make_axis() {

        //const x_axis = d3.axisBottom(this.x);
        const y_axis = d3.axisLeft(this.y_hist);

        /*

        this.x_axis = this.svg
          .append('g')
          .classed('axis', true)
          .classed('hidden', true)
          .attr('transform', `translate(0,${this.margin})`)
          .call(x_axis)
        ;

        */

        this.y_axis = this.svg
          .append('g')
          .classed('axis', true)
          .classed('hidden', true)
          .attr('transform', `translate(${this.margin}, 0)`)
          .call(y_axis)
        ;

    }

    show_axis(axis) {

        axis.classed('hidden', false)


    }

    update_y_axis() {

        this.y_axis
          .transition()
          .duration(500)
          .call(y_axis)
        ;

    }

}