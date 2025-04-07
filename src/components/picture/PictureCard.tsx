import styles from "@/styles/picture/PictureCard.module.css";
import { Button, Card, CardActions, CardContent } from "@mui/material";
import ExternalImage from "../ExternalImage";

interface PictureCardProps {
  id: number;
  onDeleteClick: (id: number) => void;
}

const PictureCard = ({ id, onDeleteClick }: PictureCardProps) => {
  const imageUrl = `${process.env.NEXT_PUBLIC_BACKEND_HOST}/api/v1/memo/picture/preview?id=${id}` 

  return (
    <>
      <Card className={styles.cardContainer}>
        <CardContent className={styles.cardContent}>
          <ExternalImage 
            image={imageUrl}
            width={"fit-content"} 
            alt={"Picture image"}
            className={styles.picture}          
          />
        </CardContent>
        <CardActions>
          <Button 
            variant={"contained"} 
            color={"error"} 
            className={styles.deleteButton}
            onClick={() => onDeleteClick(id)}
          >
            삭제
          </Button>
        </CardActions>
      </Card>
    </>
  )
}

export default PictureCard