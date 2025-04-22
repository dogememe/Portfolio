import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"

export default function BlogPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="mb-8 text-center text-3xl font-bold tracking-tighter sm:text-4xl">Blog</h1>

      {/* Sample Blog Post */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>UAV Progess!</CardTitle>
              <CardDescription>Version 2.0</CardDescription>
            </div>
            <span className="text-sm text-muted-foreground">April 9, 2025</span>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            I have been diligently working on my UAV! My most recent developments have been to redesign the wings to be
            slightly larger, and to also add winglets at the ends.
          </p>
          <p className="text-muted-foreground mb-4">
            It was very important to me to no comprimise the cool looks of the UAV while still improving the wings, and
            I am quite happy with the result I have acheived! Check out a picure of Version 1.0's mockup below!
          </p>
          <div className="relative aspect-video w-full overflow-hidden rounded-lg mt-6 mb-4">
            <Image
              src="https://zmtbsodvdekwtp1d.public.blob.vercel-storage.com/IMG_1229-a8dhZbdSZ7DqJ9qCeysh8RKlooTWYb.JPG"
              alt="UAV Prototype assembly"
              fill
              className="object-contain bg-background"
            />
          </div>
        </CardContent>
      </Card>

      {/* Placeholder for future posts */}
      <Card>
        <CardHeader>
          <CardTitle>More Posts Coming Soon</CardTitle>
          <CardDescription>Stay tuned for future updates and technical deep-dives</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Check back later for updates and new content!</p>
        </CardContent>
      </Card>
    </div>
  )
}
