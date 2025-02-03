import { IPersonalStickyComponent } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Github, Linkedin, Youtube, Mail, Phone, MapPin } from "lucide-react";
import Link from "next/link";

const PersonalStickyComponent: React.FC<IPersonalStickyComponent> = (props) => {
  const { name, email, phone, description, location, linkedin, github, youtube } = props.personal;

  return (
    <Card className="will-change-transform translate-z-0 backface-visibility-hidden">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">{name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span>{email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            <span>{phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{location}</span>
          </div>
        </div>
        <p className="text-sm">{description}</p>
        <div className="flex gap-2">
          <Link href={github} target="_blank">
            <Button variant="outline" size="icon">
              <Github className="h-4 w-4" />
            </Button>
          </Link>
          <Link href={linkedin} target="_blank">
            <Button variant="outline" size="icon">
              <Linkedin className="h-4 w-4" />
            </Button>
          </Link>
          <Link href={youtube} target="_blank">
            <Button variant="outline" size="icon">
              <Youtube className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonalStickyComponent;
