'use strict';

function assert(cond) {
  if(! cond) {
    throw "assertion failed";
  }
}

var IndexItem = React.createClass({
  render: function() {
    return <li><a onClick={this.handleClick}>{this.props.item.path}</a></li>;
  },
  handleClick: function(evt) {
    evt.preventDefault();
    edit(this.props.item);
  }
});

var IndexView = React.createClass({
  render: function() {
    var indexItemList = this.props.data.map((item) => <IndexItem item={item} />);
    return <ul className="list-unstyled">{indexItemList}</ul>;
  }
});

var SrcView = React.createClass({
  render: function() {
    var title = <h2><tt>{this.props.item.path}</tt></h2>;
    if(this.state) {
      var html = marked(this.state.content, {sanitize: true});
      return (
        <div>
          {title}
          <pre><code>{this.state.frontMatter}</code></pre>
          <textarea ref="content">{this.state.content}</textarea>
          <div className="preview" dangerouslySetInnerHTML={{__html: html}} />
        </div>
      );
    }
    else {
      return (
        <div>
          {title}
          <p>loading <tt>{this.props.item.path}</tt> ...</p>
        </div>
      );
    }
  },
  componentDidMount: function() {
    $.get(this.props.item.url, (resp) => {
      var src = atob(resp.content);
      var lines = src.split(/\n/);
      assert(lines[0] == '---');
      lines = lines.slice(1);
      var frontMatterEnd = lines.indexOf('---');
      assert(frontMatterEnd > -1);
      this.setState({
        frontMatter: lines.slice(0, frontMatterEnd).join('\n') + '\n',
        content: lines.slice(frontMatterEnd + 1).join('\n')
      });
      this.interval = setInterval(() => { this.checkForChange(); }, 500);
    });
  },
  checkForChange: function() {
    if(! this.isMounted()) { clearInterval(this.interval); return; }
    var content = React.findDOMNode(this.refs.content).value;
    if(content != this.state.content) {
      this.setState({content: content});
    }
  }
});

var repo = window.location.search.match(/[?&]repo=([^&\/]+\/[^&\/]+)\/?/)[1];
var url = `https://api.github.com/repos/${repo}/git/trees/gh-pages?recursive=1`;

$.get(url, (resp) => {
  var fileList = resp.tree.filter((i) => {
    if(i.type != 'blob') return false;
    if(i.path == '.gitignore') return false;
    if(i.path == '_config.yml') return false;
    if(i.path.match(/^_layouts\//)) return false;
    return true;
  });

  React.render(
    <IndexView data={fileList} />,
    document.querySelector('#index')
  );
});

function edit(item) {
  var srcNode = document.querySelector('#src')
  React.unmountComponentAtNode(srcNode);
  React.render(<SrcView item={item} />, srcNode);
}
