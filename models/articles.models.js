const db = require("../db/connection");

exports.selectArticle = async (id) => {
  const query = `SELECT 
                    articles.author, 
                    title,
                    articles.article_id, 
                    articles.body,
                    topic, 
                    articles.created_at, 
                    articles.votes, 
                    CAST(comment_count AS int) 
                  FROM 
                    articles 
                  LEFT JOIN 
                    (SELECT article_id, count(comment_id) AS comment_count FROM comments GROUP BY 
                    article_id) AS comments_table
                  USING 
                    (article_id)
                  WHERE
                    articles.article_id = $1
                  ORDER BY 
                    articles.article_id
                  ;`;

  const result = await db.query(query, [id]);

  if (result.rows.length > 0) {
    return result.rows[0];
  } else {
    return Promise.reject({ status: 400, message: "Article does not exist" });
  }
};

exports.updateArticle = async (id, voteInc) => {
  const query = `UPDATE 
                    articles
                  SET 
                    votes = votes + $2
                  WHERE
                    article_id = $1
                  RETURNING *;`;

  const result = await db.query(query, [id, voteInc]);

  if (result.rows.length > 0) {
    return result.rows[0];
  } else {
    return Promise.reject({ status: 400, message: "Article does not exist" });
  }
};

exports.selectArticles = async () => {
  const query = `SELECT 
                    articles.author, 
                    title,
                    articles.article_id, 
                    topic, 
                    articles.created_at, 
                    articles.votes, 
                    COALESCE(comment_count,0) AS comment_count
                  FROM 
                    articles 
                  LEFT JOIN 
                    (SELECT article_id, COUNT(comment_id)::int AS comment_count FROM comments GROUP BY 
                    article_id) AS comments_table
                  USING 
                    (article_id)
                  ORDER BY 
                    articles.article_id
                  ;`;

  const result = await db.query(query);
  return result.rows;
};