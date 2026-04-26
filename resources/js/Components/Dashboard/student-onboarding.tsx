import * as React from "react"
import { ScrollArea, ScrollBar } from "@/Components/ui/scroll-area"
import { Card } from "@/Components/ui/card"
import { Button } from "@/Components/ui/button" 

import fileStack from "../../../images/file-stack.png";
import lanyard from "../../../images/lanyard-two.png";

export interface Artwork {
  artist: string
  art: string 
}

export const works: Artwork[] = [
  { artist: "Ornella Binni", art: fileStack },
  { artist: "Tom Byrom", art: lanyard },
]

export function ScrollAreaHorizontalDemo() {
  return (
    <ScrollArea className="w-full">
      <div className="flex w-max space-x-4 p-4">
        {works.map((artwork) => (
          <Card key={artwork.artist} className="w-[400px] shrink-0 flex flex-row overflow-hidden">
            
            <div className="w-[150px] shrink-0 bg-muted">
              <img
                src={artwork.art}
                alt={`Photo by ${artwork.artist}`}
                className="h-full w-full object-cover" 
              />
            </div>

            {/* 3. Right Column: Content + Buttons */}
            <div className="flex flex-col p-4 justify-between flex-grow">
              <div className="space-y-1">
                <h3 className="font-semibold">{artwork.artist}</h3>
                <p className="text-sm text-muted-foreground">
                  Here is some detailed information about this work.
                </p>
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button size="sm">View</Button>
                <Button size="sm" variant="outline">Save</Button>
              </div>
            </div>

          </Card>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}