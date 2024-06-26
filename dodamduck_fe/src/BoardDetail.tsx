import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, ListGroup, Form } from "react-bootstrap";
import axios from "axios";
import React, { useState, useEffect, ChangeEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperPlane,
  faTrashCan,
  faPen,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "./AuthContext";

interface Comment {
  id: string;
  userName: string;
  content: string;
  created_at: string;
}

interface Post {
  image_url: string;
  profile_url: string;
  userName: string;
  created_at: string;
  title: string;
  views: number;
  content: string;
}

const BoardDetail: React.FC = () => {
  let { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [contentShare, setContentShare] = useState<Post | null>(null);
  const [ContentComments, setContentComments] = useState<Comment[]>([]);
  const [comment, setComment] = useState("");

  const handleCommentChange = (e: ChangeEvent<HTMLInputElement>) => {
    setComment(e.target.value);
  };

  const submitComment = async () => {
    const existingToken = localStorage.getItem("token");
    if (existingToken) {
      try {
        const formData = new FormData();
        formData.append("share_id", id!);
        formData.append("user_id", user!.userID);
        formData.append("comment", comment);

        const response = await axios.post(
          "http://sy2978.dothome.co.kr/upload_share_comment.php",
          formData,
          {
            headers: { Authorization: `Bearer ${existingToken}` },
          }
        );
        if (response.status === 200 && response.data.error === false) {
          console.log("댓글이 성공적으로 등록되었습니다.", response.data);
          const newComment: Comment = {
            id: response.data.comment_id,
            userName: user!.userName,
            content: comment,
            created_at: response.data.created_at,
          };

          setContentComments((prevComments) => [newComment, ...prevComments]);
          setComment("");
        } else {
          console.error("댓글 등록에 실패했습니다.");
        }
      } catch (error) {
        console.error("댓글을 등록하는 동안 오류가 발생했습니다.", error);
      }
    }
  };

  useEffect(() => {
    const fetchDetail = async () => {
      const existingToken = localStorage.getItem("token");
      if (existingToken) {
        try {
          const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${existingToken}`,
          };
          const response = await axios.get(
            `http://sy2978.dothome.co.kr/ContentShare_Detail.php?share_id=${id}`,
            { headers }
          );
          const sortedComments = Array.isArray(response.data.comments)
            ? response.data.comments.sort(
                (a: Comment, b: Comment) =>
                  new Date(a.created_at).getTime() -
                  new Date(b.created_at).getTime()
              )
            : [];
          if (response.status === 200 && response.data) {
            setContentShare(response.data.post);
            setContentComments(sortedComments);
            console.log(id);
            console.log(response.data);
          }
        } catch (error) {
          console.error("실패함", error);
        }
      }
    };

    fetchDetail();
  }, [user, id]);

  const deletePost = async () => {
    console.log(`share_id는? ${id}, user_id는?? ${user!.userID}`);
    const existingToken = localStorage.getItem("token");
    if (existingToken) {
      try {
        const response = await axios.delete(
          `http://sy2978.dothome.co.kr/ShareContentDelete.php`,
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Authorization: `Bearer ${existingToken}`,
            },
            data: new URLSearchParams({
              share_id: id!,
              user_id: user!.userID,
            }).toString(),
          }
        );

        console.log("Response from server:", response.data);
        if (response.status === 200 && response.data.error === "false") {
          console.log("게시물이 성공적으로 삭제되었습니다.");
          navigate("/board");
        } else {
          console.error("게시물 삭제에 실패했습니다.", response.data.message);
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(
            "게시물을 삭제하는 동안 오류가 발생했습니다.",
            error.message
          );
        } else {
          console.error("알 수 없는 오류가 발생했습니다.", error);
        }
      }
    }
  };

  if (!contentShare) {
    return <div>로딩중...</div>;
  }

  return (
    <div className="shring-detail-card" style={{ padding: "100px" }}>
      <Card className="text-center">
        <Card.Header>도담덕 자유 게시판</Card.Header>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <div style={{ flex: 1 }}>
            <Card.Body>
              <Card.Img
                variant="top"
                src={contentShare?.image_url}
                width={"100px"}
                height={"460px"}
              />
              <Card.Title style={{ marginTop: "20px" }}>
                <div
                  style={{
                    display: "flex",
                    marginLeft: "15px",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div style={{ display: "flex" }}>
                    <img
                      src={
                        contentShare?.profile_url
                          ? contentShare.profile_url
                          : "https://www.lab2050.org/common/img/default_profile.png"
                      }
                      width={"65px"}
                      height={"65px"}
                      style={{ borderRadius: "50%" }}
                      alt="profile"
                    />
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                      }}
                    >
                      <h5 style={{ display: "flex", marginLeft: "15px " }}>
                        {contentShare?.userName}님
                      </h5>
                      <div style={{ display: "flex" }}>
                        <h6 className="upload-date">
                          {contentShare?.created_at}
                        </h6>
                      </div>
                    </div>
                  </div>
                  {user && user.userName !== contentShare.userName && (
                    <Button className="chatting-btn">채팅하기</Button>
                  )}
                </div>
              </Card.Title>
            </Card.Body>
          </div>
          <div className="board-detail-line"></div>
          <div style={{ flex: 1, padding: "20px" }}>
            <ListGroup className="list-group-flush">
              <ListGroup.Item>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <h4>{contentShare?.title}</h4>
                  <div className="sharing-views">
                    조회수: {contentShare?.views}
                  </div>
                </div>
                <h5 className="sharing-detail-content">
                  {contentShare?.content}
                  <div className="sharing-delete">
                    {user && user.userName === contentShare.userName && (
                      <>
                        <FontAwesomeIcon
                          icon={faPen}
                          style={{
                            color: "#4d4d4d",
                            marginRight: "7px",
                            cursor: "pointer",
                          }}
                        />
                        <FontAwesomeIcon
                          icon={faTrashCan}
                          style={{ color: "#4d4d4d", cursor: "pointer" }}
                          onClick={deletePost}
                        />
                      </>
                    )}
                  </div>
                </h5>
              </ListGroup.Item>
              <ListGroup.Item></ListGroup.Item>
            </ListGroup>

            <ListGroup.Item className="comment-section">
              <div className="page-container">
                <div className="content-wrapper">
                  <ListGroup.Item className="comment-section">
                    <div className="comment-radio font-border">댓글</div>
                    <div
                      className="comment-content"
                      style={{ maxHeight: "350px", overflowY: "auto" }}
                    >
                      {ContentComments.map((comment) => (
                        <div key={comment.id}>
                          <div className="sharing-comment-style">
                            <p className="sharing-comment">
                              {comment.userName}님
                            </p>
                            <p className="sharing-comment-created">
                              {comment.created_at}
                            </p>
                          </div>
                          <div style={{ marginLeft: "10px" }}>
                            <p className="sharing-comment-content">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ListGroup.Item>
                </div>
                {user && (
                  <div className="comment-section">
                    <Form.Control
                      type="text"
                      placeholder="댓글을 입력해주세요."
                      className="comment-ready"
                      value={comment}
                      onChange={handleCommentChange}
                    />
                    <FontAwesomeIcon
                      icon={faPaperPlane}
                      style={{
                        color: "#dcdcdc",
                        marginLeft: "10px",
                        cursor: "pointer",
                        marginTop: "-22px",
                      }}
                      onClick={submitComment}
                    />
                  </div>
                )}
              </div>
            </ListGroup.Item>
          </div>
        </div>
        <Card.Footer
          className="text-muted"
          style={{ cursor: "pointer" }}
          onClick={() => {
            navigate("/board");
          }}
        >
          게시글 목록 보기
        </Card.Footer>
      </Card>
    </div>
  );
};

export default BoardDetail;
