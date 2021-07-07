'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace);
};

var AutoHelp = function (_Component) {
  _inherits(AutoHelp, _Component);

  function AutoHelp(props) {
    _classCallCheck(this, AutoHelp);

    var _this = _possibleConstructorReturn(this, (AutoHelp.__proto__ || Object.getPrototypeOf(AutoHelp)).call(this, props));

    window.autohelp = _this;
    _this.state = {
      focused: false,
      elementObj: "",
      message: ""
    };

    return _this;
  }

  _createClass(AutoHelp, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var that = this;

      var editors = [window.editor];

      editors.forEach(function (editor) {
        editor.on("focus", function () {
          window.htmlcodeeditor = editor;
          that.onFocusEditor.bind(that)();
          window.$("#javascript_button").hide();
          window.$("#presentation_button").hide();
          window.$("#html_help_button").hide();
        });

        // editor.on("blur",function(){
        //   that.setState({focused:false})
        // })

        editor.on("click", function () {
          window.htmlcodeeditor = editor;
          that.onClickEditor.bind(that)();
        });
      });
    }
  }, {
    key: 'displayMessage',
    value: function displayMessage(message) {
      var that = this;
      window.$("#auto_help_container").show();
      this.setState({ message: message, focused: true });
      setTimeout(function () {
        window.$("#auto_help_container").hide();
        that.setState({ message: "", elementObj: "", focused: false });
      }, 10000);
    }
  }, {
    key: 'onFocusEditor',
    value: function onFocusEditor() {
      var that = this;
      window.$("#auto_help_container").show();
      this.setState({ focused: true }, function () {
        that.onClickEditor.bind(this)();
      });
    }
  }, {
    key: 'onClickEditor',
    value: function onClickEditor() {
      var that = this;
      var htmlValue = window.htmlcodeeditor.getValue();
      var elements = ["input", "button", "p", "h1", "image"];
      var indexes = {};
      var htmlRendered = window.splitHTML(window.htmlcodeeditor.getValue()).filter(function (a) {
        return a.indexOf("<") !== -1 && a.indexOf(">") !== -1 && elements.filter(function (b) {
          return a.indexOf("<" + b) !== -1;
        }).length > 0;
      });
      htmlRendered = htmlRendered.map(function (a) {
        return elements.filter(function (b) {
          return a.indexOf(b) !== -1;
        })[0];
      });
      var element_indexes = [];
      var searchedStr = htmlValue;
      var buffer = 0;

      htmlRendered.forEach(function (elem) {
        searchedStr = htmlValue.slice(buffer);
        var eIndex = { type: elem };
        eIndex.starting = buffer + searchedStr.indexOf("<" + elem);

        buffer = eIndex.starting;
        searchedStr = htmlValue.slice(eIndex.starting);
        eIndex.ending = searchedStr.indexOf("</" + elem + ">") + ("</" + elem + ">").length + buffer;

        buffer = eIndex.ending;
        searchedStr = searchedStr.slice(eIndex.ending);
        element_indexes.push(eIndex);
      });
      var cposition = window.htmlcodeeditor.session.doc.positionToIndex(window.htmlcodeeditor.selection.getCursor());
      var cposition_in_element = false;
      element_indexes.forEach(function (index_tuple) {
        if (cposition > index_tuple.starting && cposition < index_tuple.ending) {
          cposition_in_element = true;
          that.state.elementObj = index_tuple;
        }
      });
      if (!cposition_in_element) {
        that.setState({ elementObj: "" });
      } else {
        that.setState({ elementObj: that.state.elementObj });
      }
    }
  }, {
    key: 'onEditorLoseFocus',
    value: function onEditorLoseFocus() {
      window.$("#auto_help_container").hide();
      this.setState({ focused: false });
    }
  }, {
    key: 'createStyleMessage',
    value: function createStyleMessage(style, value) {
      try {
        var that = this;
        var element = that.state.elementObj.type;
        // alert(JSON.stringify(that.state.elementObj));
        var elementHTML = window.htmlcodeeditor.getValue().slice(that.state.elementObj.starting, that.state.elementObj.ending);
        var mockedElem = window.$(elementHTML);
        mockedElem.css(style, value);
        var htmlStr = mockedElem[0].outerHTML;
        // return ""  

        if (elementHTML.indexOf("style") === -1) {
          var styleIndex = htmlStr.indexOf("style");
          var highlightable = htmlStr.slice(htmlStr.indexOf("style"), htmlStr.indexOf(';"'));
          var messageStr = "OK! To change this " + element + " first add a style. Put your cursor right after the " + element.split("")[element.split("").length - 1] + " in " + element + ' and write style = "' + style + ':' + value + '". (Add the red part). Like this:' + '           \n\n';
        } else {
          // alert("here!")
          var styleIndex = htmlStr.indexOf(style + ": " + value);
          var highlightable = style + ":" + value;
          var messageStr = 'Put your cursor right between the semicolon (;) and the last style quote " and write ' + style + ' :' + value + ', like this (add the red part):"\n\n\n';
        }

        return messageStr.split("").map(function (char, ind) {

          if (char === '"') {
            return React.createElement(
              'span',
              { style: { color: "green" } },
              char
            );
          }
          return React.createElement(
            'span',
            null,
            char
          );
        }).concat(htmlStr.replace("rgb(255, 0, 0)", "red").split("").map(function (char, ind) {
          if (ind > styleIndex - 1 && ind < styleIndex + highlightable.length + 2) {
            return React.createElement(
              'span',
              { style: { color: "red" } },
              char
            );
          }
          if (char === '"') {
            return React.createElement(
              'span',
              { style: { color: "blue" } },
              char
            );
          }
          return React.createElement(
            'span',
            null,
            char
          );
        }));
      } catch (e) {
        console.log(e);
        return 'There was an issue with auto-help. Ask your teacher!';
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var that = this;
      if (!that.state.focused) {
        var content = React.createElement('img', { 'class': 'draggable', id: 'elements_img', style: { height: "100%", width: "100%", display:"none" }, src: '/htmlguide.png' });
      } else if (that.state.message !== "") {
        var content = React.createElement(
          'div',
          { style: { height: "100%", width: "100%", backgroundColor: "#1d1f20" }, id: 'growing_anim' },
          React.createElement(
            'h1',
            { style: { alignItems: "center", marginTop:"0%",  whiteSpace: "pre-wrap", color: "#d7b94c", fontSize: "14px" }, 'class': 'typing' },
            that.state.message
          )
        );
      } else if (that.state.elementObj !== "") {
        var element = that.state.elementObj.type;
        var elementHTML = window.htmlcodeeditor.getValue().slice(that.state.elementObj.starting, that.state.elementObj.ending);
        var mockedElem = window.$(elementHTML);

        var content = React.createElement(
          'div',
          { style: { height: "100%", width: "100%", backgroundColor: "#1d1f20", alignItems: "center" } },
          React.createElement(
            'h2',
            { style: { marginTop:"0%",textAlign: "center", color: "white" } },
            'What are you trying to do to this ',
            element,
            ' ?'
          ),
          React.createElement('image', { src: '/chatbot.gif' }),
          React.createElement(
            'div',
            { className: 'grid grid-cols-2' },
            React.createElement(
              'button',
              { onClick: function onClick() {
                  that.displayMessage.bind(that)(that.createStyleMessage.bind(that)("background-color", "red"));
                }, className: '_3d primary', style: { backgroundColor: "orange" } },
              'Change its color'
            ),
            React.createElement(
              'button',
              { onClick: function onClick() {
                  that.displayMessage.bind(that)(that.createStyleMessage.bind(that)("font-family", "Arial"));
                }, className: '_3d primary', style: { backgroundColor: "orange" } },
              'Change its font'
            ),
            React.createElement(
              'button',
              { onClick: function onClick() {
                  that.displayMessage.bind(that)(that.createStyleMessage.bind(that)("font-size", "16px"));
                }, className: '_3d primary', style: { backgroundColor: "orange" } },
              'Change its font size'
            ),
            React.createElement(
              'button',
              { onClick: function onClick() {
                  that.displayMessage.bind(that)(that.createStyleMessage.bind(that)("color", "red"));
                }, className: '_3d primary', style: { backgroundColor: "orange" } },
              'Change its font color'
            ),
            React.createElement(
              'button',
              { className: '_3d primary', style: { backgroundColor: "orange" }, onClick: function onClick() {
                  that.displayMessage.bind(that)(that.createStyleMessage.bind(that)("height", "100%"));
                } },
              'Make it taller'
            ),
            React.createElement(
              'button',
              { onClick: function onClick() {
                  that.displayMessage.bind(that)(that.createStyleMessage.bind(that)("width", "50%"));
                }, className: '_3d primary', style: { backgroundColor: "orange" } },
              'Make it wider'
            ),
            element === "image" ? React.createElement(
              'button',
              { className: '_3d primary' },
              'Set what image it is'
            ) : null
          )
        );
      } else if (that.state.focused) {
        var elements = ["input", "button", "p", "h1", "image"];
        var content = React.createElement(
          'div',
          { style: { height: "100%", width: "100%", backgroundColor: "tan" } },
          React.createElement(
            'h2',
            { style: {marginTop:"0%", color: "black" } },
            'What are you trying to add to your page?'
          ),
          React.createElement(
            'div',
            { className: 'grid grid-cols-2' },
            elements.map(function (element) {
              return React.createElement(
                'button',
                { className: '_3d primary', style: { backgroundColor: "silver", float: "left", width: "33%", borderRadius: "5px", color: "black" }, onClick: function onClick() {

                    if (element === "image") {
                      return that.displayMessage.bind(that)('OK! Add this to your site. Make sure you are typing outside of any of the existing elements:\n                ' + '\n    <' + element + ' src = "image_link_here" > </' + element + '>\n\n                ');
                    }
                    that.displayMessage.bind(that)('OK! Add this to your site. Make sure you are typing outside of any of the existing elements:\n                ' + '\n    <' + element + '> Your inner text here </' + element + '>\n\n                ');
                  } },
                'Make an ',
                element
              );
            })
          )
        );
      } else {
        var content = React.createElement('img', { 'class': 'draggable', id: 'elements_img', style: { height: "100%", width: "100%", display:"none" }, src: '/htmlguide.png' });
      }
      return React.createElement(
        'button',
        { onClick: function onClick() {
          window.$("#auto_help_container").show();
            that.setState.bind(that)({ focused: true });
          }, id: 'auto_help', style: { backgroundColor: "#2A374F", width: "100%", height: "100%" } },
        content
      );
    }
  }]);

  return AutoHelp;
}(React.Component);

export default AutoHelp;
var domContainer = document.querySelector('#auto_help_container');
ReactDOM.render(React.createElement(AutoHelp, null), domContainer);