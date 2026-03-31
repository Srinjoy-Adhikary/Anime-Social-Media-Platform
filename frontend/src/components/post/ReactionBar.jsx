import axios from "axios";

function ReactionBar({ post, updatePost }) {

  const react = async (reactionType) => {
    try {

      const res = await axios.post(
        `/api/posts/${post._id}/react`,
        {
          userId: "demoUser",   // temporary user
          reaction: reactionType
        }
      );

      updatePost(res.data);

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{display:"flex", gap:"10px", marginTop:"10px"}}>

      <button onClick={() => react("peak")}>
        🔥 {post.reactions?.peak}
      </button>

      <button onClick={() => react("sad")}>
        😢 {post.reactions?.sad}
      </button>

      <button onClick={() => react("shock")}>
        😱 {post.reactions?.shock}
      </button>

      <button onClick={() => react("mindblown")}>
        🤯 {post.reactions?.mindblown}
      </button>

      <button onClick={() => react("love")}>
        ❤️ {post.reactions?.love}
      </button>

    </div>
  );
}

export default ReactionBar;