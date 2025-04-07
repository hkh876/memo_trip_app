import styles from "@/styles/memo/MemoCard.module.css";
import { Button, Card, CardActions, CardContent, CardHeader, Typography } from "@mui/material";

interface MemoTableContentProps {
  memoId: number;
  title: string;
  contents: string;
  eventDate: string;
  onPictureClick: (memoId: number) => void;
  onUpdateClick: (id: number) => void;
  onDeleteClick: (id: number) => void;
}

const MemoCard = ({ memoId, title, contents, eventDate,
  onPictureClick, onUpdateClick, onDeleteClick 
}: MemoTableContentProps) => {
  return (
    <>
      <Card className={styles.cardContainer}>
        <CardHeader title={title} />
        <CardContent className={styles.cardContent}>{contents}</CardContent>
        <CardActions>
          <Button 
            variant={"contained"} 
            color={"secondary"} 
            onClick={() => onPictureClick(memoId)}
          >
            사진
          </Button>
          <Button variant={"contained"} color={"info"} onClick={() => onUpdateClick(memoId)}>수정</Button>
          <Button variant={"contained"} color={"error"} onClick={() => onDeleteClick(memoId)}>삭제</Button>
          <Typography className={styles.eventDateText}>{eventDate}</Typography>
        </CardActions>
      </Card>
    </>
  )
}

export default MemoCard