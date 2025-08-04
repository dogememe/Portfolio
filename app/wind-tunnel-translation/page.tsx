"use client"

import { ArrowLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

function GLBViewer() {
  const mountRef = useRef<HTMLDivElement>(null)
  const cleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (!mountRef.current) return

    // Load Three.js from CDN
    const loadThreeJS = async () => {
      // Load Three.js core
      if (!(window as any).THREE) {
        const script = document.createElement("script")
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r158/three.min.js"
        document.head.appendChild(script)

        await new Promise((resolve) => {
          script.onload = resolve
        })
      }

      // Load GLTFLoader
      if (!(window as any).GLTFLoader) {
        const gltfScript = document.createElement("script")
        gltfScript.src = "https://cdn.jsdelivr.net/npm/three@0.158.0/examples/js/loaders/GLTFLoader.js"
        document.head.appendChild(gltfScript)

        await new Promise((resolve) => {
          gltfScript.onload = resolve
        })
      }

      // Load OrbitControls
      if (!(window as any).OrbitControls) {
        const controlsScript = document.createElement("script")
        controlsScript.src = "https://cdn.jsdelivr.net/npm/three@0.158.0/examples/js/controls/OrbitControls.js"
        document.head.appendChild(controlsScript)

        await new Promise((resolve) => {
          controlsScript.onload = resolve
        })
      }

      initViewer()
    }

    const initViewer = () => {
      if (!mountRef.current) return

      const THREE = (window as any).THREE
      const GLTFLoader = (window as any).THREE.GLTFLoader
      const OrbitControls = (window as any).THREE.OrbitControls

      // Scene setup
      const scene = new THREE.Scene()
      scene.background = new THREE.Color(0xf5f5f5)

      // Camera setup
      const camera = new THREE.PerspectiveCamera(
        75,
        mountRef.current.clientWidth / mountRef.current.clientHeight,
        0.1,
        1000,
      )
      camera.position.set(5, 5, 5)

      // Renderer setup
      const renderer = new THREE.WebGLRenderer({ antialias: true })
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      mountRef.current.appendChild(renderer.domElement)

      // Controls
      const controls = new OrbitControls(camera, renderer.domElement)
      controls.enableDamping = true
      controls.dampingFactor = 0.05
      controls.enableZoom = true
      controls.enablePan = true

      // Lighting
      const ambientLight = new THREE.AmbientLight(0x404040, 0.6)
      scene.add(ambientLight)

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
      directionalLight.position.set(10, 10, 5)
      directionalLight.castShadow = true
      scene.add(directionalLight)

      const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4)
      directionalLight2.position.set(-10, -10, -5)
      scene.add(directionalLight2)

      // Load GLB model
      const loader = new GLTFLoader()
      loader.load(
        "https://zmtbsodvdekwtp1d.public.blob.vercel-storage.com/master_asm.glb",
        (gltf) => {
          const model = gltf.scene

          // Enable shadows for all meshes
          model.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true
              child.receiveShadow = true
            }
          })

          // Center and scale the model
          const box = new THREE.Box3().setFromObject(model)
          const center = box.getCenter(new THREE.Vector3())
          const size = box.getSize(new THREE.Vector3())

          // Scale model to fit in view
          const maxDim = Math.max(size.x, size.y, size.z)
          const scale = 4 / maxDim
          model.scale.setScalar(scale)

          // Center the model
          model.position.sub(center.multiplyScalar(scale))

          scene.add(model)

          // Adjust camera position based on model size
          const distance = maxDim * scale * 1.5
          camera.position.set(distance, distance, distance)
          camera.lookAt(0, 0, 0)
          controls.update()
        },
        (progress) => {
          console.log("Loading progress:", (progress.loaded / progress.total) * 100 + "%")
        },
        (error) => {
          console.error("Error loading GLB model:", error)
        },
      )

      // Animation loop
      let animationId: number
      const animate = () => {
        animationId = requestAnimationFrame(animate)
        controls.update()
        renderer.render(scene, camera)
      }
      animate()

      // Handle resize
      const handleResize = () => {
        if (!mountRef.current) return

        const width = mountRef.current.clientWidth
        const height = mountRef.current.clientHeight

        camera.aspect = width / height
        camera.updateProjectionMatrix()
        renderer.setSize(width, height)
      }

      window.addEventListener("resize", handleResize)

      // Store cleanup function
      cleanupRef.current = () => {
        window.removeEventListener("resize", handleResize)

        if (animationId) {
          cancelAnimationFrame(animationId)
        }

        if (mountRef.current && renderer.domElement) {
          mountRef.current.removeChild(renderer.domElement)
        }

        renderer.dispose()
        scene.clear()
      }
    }

    loadThreeJS().catch(console.error)

    // Cleanup on unmount
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current()
      }
    }
  }, [])

  return (
    <div
      ref={mountRef}
      className="w-full h-full min-h-[400px] rounded-lg overflow-hidden"
      style={{ aspectRatio: "16/9" }}
    />
  )
}

export default function WindTunnelTranslationProject() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Portfolio
            </Button>
          </Link>
        </div>

        {/* Project Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tighter">Wind Tunnel Translation Project</h1>
          <p className="mt-4 text-xl text-muted-foreground">
            Automated Translation System for Wind Tunnel Testing Equipment
          </p>
        </div>

        {/* Project Description */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Project Overview</CardTitle>
            <CardDescription>Precision Control System Development</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
              dolore magna aliqua.
            </p>
          </CardContent>
        </Card>

        {/* YouTube Video Embed */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>System Demonstration</CardTitle>
            <CardDescription>Watch the translation system in action</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-video w-full rounded-lg overflow-hidden">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                title="Wind Tunnel Translation System Demo"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
            <p className="mt-4 text-muted-foreground">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </CardContent>
        </Card>

        {/* Project Image */}
        <div className="relative mb-12 aspect-video w-full overflow-hidden rounded-lg">
          <Image
            src="/placeholder.svg?height=600&width=800"
            alt="Wind Tunnel Translation System"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Code Blocks Side by Side */}
        <div className="grid gap-8 md:grid-cols-2 mb-8">
          {/* Control Algorithm Code Block */}
          <Card>
            <CardHeader>
              <CardTitle>Control Algorithm</CardTitle>
              <CardDescription>Python control system implementation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm">
                  <code>Lorem ipsum dolor sit amet...</code>
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Arduino Firmware Code Block */}
          <Card>
            <CardHeader>
              <CardTitle>Arduino Firmware</CardTitle>
              <CardDescription>Stepper motor control firmware</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm">
                  <code>Lorem ipsum dolor sit amet...</code>
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Code Block Descriptions */}
        <div className="grid gap-8 md:grid-cols-2 mb-8">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Control Algorithm Implementation</h3>
              <p className="text-muted-foreground text-sm">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Arduino Firmware Details</h3>
              <p className="text-muted-foreground text-sm">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Technical Description */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Technical Implementation</CardTitle>
            <CardDescription>System Architecture and Design Considerations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua.
              </p>
              <p className="text-muted-foreground">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua.
              </p>
              <p className="text-muted-foreground">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* CAD Model Viewer */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>3D CAD Model</CardTitle>
            <CardDescription>Interactive model of the translation mechanism</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-video w-full rounded-lg overflow-hidden bg-muted">
              <GLBViewer />
            </div>
            <p className="mt-4 text-muted-foreground text-sm">
              Interactive 3D model - Use mouse to rotate, zoom, and pan around the model.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
