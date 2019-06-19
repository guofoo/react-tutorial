/**
 * This file provided by Facebook is for non-commercial testing and evaluation purposes only.
 * Facebook reserves all rights not expressly granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * FACEBOOK BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

var converter = new Showdown.converter();

var Comment = React.createClass({
  render: function() {
    var rawMarkup = converter.makeHtml(this.props.children.toString());
    return (
      <li>
        <div className="commenterImage">
          <img src={"http://lorempixel.com/50/50/people/"+this.props.index} />
        </div>
        <div className="commentText">
          <p className="" dangerouslySetInnerHTML={{__html: rawMarkup}}></p> 
          <span className="date sub-text">by {this.props.author}</span>
        </div>      
      </li>
    );
  }
});

var CommentBox = React.createClass({
  loadCommentsFromServer: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  handleCommentSubmit: function(comment) {
    var comments = this.state.data.comments;
    comments.push(comment);
    this.setState({data: {content: this.state.data.content, comments: comments}}, function() {
      // `setState` accepts a callback. To avoid (improbable) race condition,
      // `we'll send the ajax request right after we optimistically set the new
      // `state.
      $.ajax({
        url: this.props.url,
        dataType: 'json',
        type: 'POST',
        data: comment,
        success: function(data) {
          this.setState({data: data});
        }.bind(this),
        error: function(xhr, status, err) {
          console.error(this.props.url, status, err.toString());
        }.bind(this)
      });
    });
  },
  getInitialState: function() {
    return {data: {content:"", comments: []}};
  },
  componentDidMount: function() {
    this.loadCommentsFromServer();
    setInterval(this.loadCommentsFromServer, this.props.pollInterval);
  },
  render: function() {
    return (
      <div className="detailBox">
        <div className="titleBox">
          <label>Comment Box</label>
          <button type="button" className="close" aria-hidden="true">&times;</button>
        </div>
        <div className="commentBox">
          Hello, world! I am a CommentBox.
        </div>
        <div className="actionBox">
          <CommentList data={this.state.data.comments} />
          <CommentForm onCommentSubmit={this.handleCommentSubmit} />
        </div>
      </div>
    );
  }
});

var CommentList = React.createClass({
  render: function() {
    var commentNodes = this.props.data.map(function(comment, index) {
      return (
        // `key` is a React-specific concept and is not mandatory for the
        // purpose of this tutorial. if you're curious, see more here:
        // http://facebook.github.io/react/docs/multiple-components.html#dynamic-children
        <Comment author={comment.author} key={index} index={index}>
          {comment.text}
        </Comment>
      );
    });
    return (
      <ul className="commentList">
        {commentNodes}
      </ul>
    );
  }
});

var CommentForm = React.createClass({
  handleSubmit: function(e) {
    e.preventDefault();
    var author = "me";
    var text = this.refs.text.getDOMNode().value.trim();
    if (!text) {
      return;
    }
    this.props.onCommentSubmit({author: author, text: text});
    this.refs.text.getDOMNode().value = '';
  },
  render: function() {
    return (
      <form className="form-inline" role="form" onSubmit={this.handleSubmit}>
        <div className="form-group">
          <input className="form-control" type="text" placeholder="Your comments" ref="text" />
        </div>
        <div className="form-group">
          <input type="submit" className="btn btn-default" value="Add" />
        </div>
      </form> 
    );
  }
});

React.render(
  <CommentBox url="comments.json" pollInterval={60000} />,
  document.getElementById('content')
);
