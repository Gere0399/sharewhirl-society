import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface ProfileHeaderProps {
  profile: any;
  isOwnProfile: boolean;
  onEditClick: () => void;
}

export function ProfileHeader({ profile, isOwnProfile, onEditClick }: ProfileHeaderProps) {
  return (
    <Card className="mb-8">
      <CardHeader className="relative">
        {isOwnProfile && (
          <Button
            variant="outline"
            size="icon"
            className="absolute top-4 right-4"
            onClick={onEditClick}
          >
            <Edit className="h-4 w-4" />
          </Button>
        )}
        <div className="flex flex-col items-center gap-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback>{profile?.username?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="text-center">
            <h1 className="text-2xl font-bold">{profile?.username}</h1>
            {profile?.full_name && (
              <p className="text-muted-foreground">{profile.full_name}</p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {profile?.bio && (
          <p className="text-center text-muted-foreground">{profile.bio}</p>
        )}
      </CardContent>
    </Card>
  );
}