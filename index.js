// selectors.js

const rootContainer = document.querySelector("#root");
const commentsContainer = document.querySelector("#root .container");
const commentInput = document.querySelector(".comment__input textarea");
const commentButton = document.querySelector(
  ".comment__form .comment__control button"
);

const classes = {
  COMMENT_CONTAINER: "comments__container",
};

// comment Schema
/**
    {
        id: string,
        body: string,
        parent: string,
        likes: number,
        disLikes: number
        children: [comment]
    } 

*/

// storage apis
const COMMENT = "COMMENTS";

const getComments = (id = null) => {
  const comments = JSON.parse(localStorage.getItem(COMMENT));
  if (id) {
    return comments.find((c) => c.id === id);
  }
  return comments || [];
};

const saveComments = (comments) => {
  localStorage.setItem(COMMENT, JSON.stringify(comments));
};

const addComment = (comment) => {
  let comments = getComments();
  comments.push(comment);
  saveComments(comments);
};

// unitl.js
const getRandomId = () => Math.random().toString().substring(2, 7);
const generateComment = (body, parent = null) => ({
  id: getRandomId(),
  body,
  parent,
  likes: 0,
  dislikes: 0,
  children: [],
});
const addCommentHandler = (commentText, parentId = null) => {
  let newComment = generateComment(commentText);
  addComment(newComment);
  commentsContainer.innerHTML = "";
  renderComments(getComments(), commentsContainer);
};

const updateComments = (list, id, prop, cb, comment) => {
  list.forEach((com) => {
    if (com.id === id && comment) {
      com[prop] = cb(com[prop] || [], comment);
    } else if (com.id === id) {
      com[prop] = cb(com[prop] || 0);
    } else if (com.children && com.children.length > 0) {
      updateComments(com.children, id, prop, cb, comment);
    }
  });

  return list;
};

const likeHandler = (id) => {
  if (!id) {
    throw new Error("ID not prsent: " + id);
    return;
  }
  const comments = getComments();
  const updatedComments = updateComments(comments, id, "likes", (l) => l + 1);
  saveComments(updatedComments);
  commentsContainer.innerHTML = "";
  renderComments(getComments(), commentsContainer);
};

const disLikeHandler = (id) => {
  if (!id) {
    throw new Error("ID not prsent: " + id);
    return;
  }
  const comments = getComments();
  const updatedComments = updateComments(
    comments,
    id,
    "dislikes",
    (l) => l + 1
  );
  saveComments(updatedComments);
  commentsContainer.innerHTML = "";
  renderComments(getComments(), commentsContainer);
};

const replySubmitHandler = (id, node, ref) => {
  let comments = getComments();
  let newComment = generateComment(node.value, id);
  let updatedComments = updateComments(
    comments,
    id,
    "children",
    (ch, comment) => {
      return [...ch, comment];
    },
    newComment
  );
  ref.remove();
  saveComments(updatedComments);
  commentsContainer.innerHTML = "";
  renderComments(getComments(), commentsContainer);
};

const replyHandler = (id) => {
  const targetElememt = document.querySelector(
    `div.comment__card[data-id="${id}"]`
  );
  const replyForm = document.createElement("div");
  replyForm.classList.add("comment__form-reply");
  replyForm.innerHTML = `
  <div class="comment__input">
      <textarea name="" id="comment-reply-input-box" cols="70" rows="10"></textarea>
  </div>
  <div class="comment__control">
      <button id="reply-comment">Comment</button>
  </div>
  `;
  targetElememt.after(replyForm);
  const replyInput = document.querySelector("textarea#comment-reply-input-box");
  replyInput.focus();
  replyForm
    .querySelector("button#reply-comment")
    .addEventListener("click", (evt) =>
      replySubmitHandler(id, replyInput, replyForm)
    );
};

const commentClickHandler = (evt) => {
  const id = evt.target.parentElement.getAttribute("data-id");
  const { classList = [] } = evt.target || {};
  switch (classList[0]) {
    case "like":
      likeHandler(id);
      break;
    case "dislike":
      disLikeHandler(id);
      break;
    case "reply":
      replyHandler(id);
      break;
    default:
      break;
  }
};

const generateCommentNode = ({
  id = "",
  body = "",
  likes = 0,
  dislikes = 0,
  children = [],
}) => {
  let commentContainer = document.createElement("div");
  commentContainer.classList.add("comments__container");

  let comment = `<div class="comment__card" data-id="${id}">
      <div class="comment__text">
          ${body}
      </div>
      <div class="comments__footer" data-id="${id}">
          <div class="like">like ${likes}</div>
          <div class="dislike">dislike ${dislikes}</div>
          <div class="reply">reply ${children.length}</div>
      </div>
  </div>`;
  commentContainer.innerHTML = comment;
  commentContainer
    .querySelector(`div.comment__card[data-id="${id}"]`)
    .addEventListener("click", commentClickHandler);
  return commentContainer;
};

const renderComments = (comments, root) => {
  comments.forEach((comment) => {
    let commentNode = generateCommentNode(comment || {});
    root.append(commentNode);
    if (comment.children && comment.children.length > 0) {
      renderComments(comment.children, commentNode);
    }
  });
};

// main.js
commentButton.addEventListener("click", (evt) => {
  const commentText = commentInput.value;
  if (!commentText) {
    alert("please enter copmkment before submit");
    return;
  }
  addCommentHandler(commentText);
});

window.addEventListener("load", () => {
  const comments = getComments();
  renderComments(comments, commentsContainer);
});
