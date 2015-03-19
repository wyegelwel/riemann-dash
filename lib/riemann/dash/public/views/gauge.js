(function() {
    var fitopts = {min: 6, max: 1000};

    var Gauge = function(json) {
      // Init
      view.View.call(this, json);
      this.clickFocusable = true;

      // Config
      this.query = json.query;
      this.title = json.title;
      this.commaSeparateThousands = json.commaSeparateThousands;
      this.displayKey = json.displayKey || "metric";
      
      // State
      this.currentEvent = null;

      // HTML
      this.el.addClass('gauge');
      this.el.append(
        '<div class="box">' +
          '<div class="quickfit metric value">?</div>' +
          '<h2 class="quickfit"></h2>' +
          '</div>'
      );

      this.box = this.el.find('.box');
      this.el.find('h2').text(this.title);

      // When clicked, display event
      var self = this;
      this.box.click(function() { eventPane.show(self.currentEvent) });

      if (this.query) {
        var reflowed = false;
        var me = this;
        var value = this.el.find('.value');
        this.sub = subs.subscribe(this.query, function(e) {
          self.currentEvent = e;
          me.box.attr('class', 'box state ' + e.state);
          var toDisplay = e[me.displayKey];
          if ($.isNumeric(toDisplay)){
            toDisplay = format.float(toDisplay, 2, me.commaSeparateThousands);
          }
          value.text(toDisplay);
          value.attr('title', e.description);

          // The first time, do a full-height reflow.
          if (reflowed) {
            value.quickfit(fitopts);
          } else {
            me.reflow();
            reflowed = true;
          }
        });
      }
    }

    view.inherit(view.View, Gauge);
    view.Gauge = Gauge;
    view.types.Gauge = Gauge;

    Gauge.prototype.json = function() {
      return $.extend(view.View.prototype.json.call(this), {
        type: 'Gauge',
        title: this.title,
        query: this.query,
        commaSeparateThousands: this.commaSeparateThousands,
        displayKey: this.displayKey
      });
    }

    var editTemplate = _.template(
        "<label for='title'>Title</label>" +
        "<input type='text' name='title' value='{{title}}' /><br />" +
        "<label for='query'>Query</label>" +
        '<textarea type="text" name="query" class="query">{{query}}</textarea>' +
        "<label for='commaSeparateThousands'>Comma Separate Thousands</label>" +
        "<input type='checkbox' name='commaSeparateThousands' {% if(commaSeparateThousands)  { %} checked='checked' {% } %} />" +
        " <br /> <label for='displayType'> Display key </label>" +
         "<input type='text' name='displayKey' value='{{displayKey}}' />");

    Gauge.prototype.editForm = function() {
      return editTemplate(this);
    }

    Gauge.prototype.reflow = function() {
      // Size metric
      var value = this.el.find('.value');
      value.quickfit({min: 6, max: 1000, font_height_scale: 1});

      // Size title
      var title = this.el.find('h2');
      title.quickfit(fitopts);
    }

    Gauge.prototype.delete = function() {
      if (this.sub) {
        subs.unsubscribe(this.sub);
      }
      view.View.prototype.delete.call(this);
    }
})();
