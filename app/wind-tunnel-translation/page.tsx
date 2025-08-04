"use client"

import { ArrowLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

function GLBViewer() {
  const mountRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const cleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (!mountRef.current) return

    const loadScript = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve()
          return
        }

        const script = document.createElement("script")
        script.src = src
        script.onload = () => resolve()
        script.onerror = () => reject(new Error(`Failed to load script: ${src}`))
        document.head.appendChild(script)
      })
    }

    const initViewer = async () => {
      try {
        // Load Three.js core
        await loadScript("https://unpkg.com/three@0.158.0/build/three.min.js")

        // Load additional modules
        await loadScript("https://unpkg.com/three@0.158.0/examples/js/loaders/GLTFLoader.js")
        await loadScript("https://unpkg.com/three@0.158.0/examples/js/controls/OrbitControls.js")

        if (!mountRef.current) return

        const THREE = (window as any).THREE

        if (!THREE) {
          throw new Error("Three.js failed to load")
        }

        // Scene setup
        const scene = new THREE.Scene()
        scene.background = new THREE.Color(0xf8f9fa)

        // Camera setup
        const width = mountRef.current.clientWidth
        const height = mountRef.current.clientHeight
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
        camera.position.set(10, 10, 10)

        // Renderer setup
        const renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
        })
        renderer.setSize(width, height)
        renderer.setPixelRatio(window.devicePixelRatio)
        renderer.shadowMap.enabled = true
        renderer.shadowMap.type = THREE.PCFSoftShadowMap
        renderer.outputColorSpace = THREE.SRGBColorSpace

        mountRef.current.appendChild(renderer.domElement)

        // Controls
        const controls = new THREE.OrbitControls(camera, renderer.domElement)
        controls.enableDamping = true
        controls.dampingFactor = 0.05
        controls.screenSpacePanning = false
        controls.minDistance = 1
        controls.maxDistance = 100

        // Lighting setup
        const ambientLight = new THREE.AmbientLight(0x404040, 1.2)
        scene.add(ambientLight)

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
        directionalLight.position.set(20, 20, 20)
        directionalLight.castShadow = true
        directionalLight.shadow.mapSize.width = 2048
        directionalLight.shadow.mapSize.height = 2048
        scene.add(directionalLight)

        const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5)
        directionalLight2.position.set(-20, -20, -20)
        scene.add(directionalLight2)

        // Add a ground plane for reference
        const groundGeometry = new THREE.PlaneGeometry(50, 50)
        const groundMaterial = new THREE.MeshLambertMaterial({
          color: 0xcccccc,
          transparent: true,
          opacity: 0.3,
        })
        const ground = new THREE.Mesh(groundGeometry, groundMaterial)
        ground.rotation.x = -Math.PI / 2
        ground.position.y = -5
        ground.receiveShadow = true
        scene.add(ground)

        // Load GLB model
        const loader = new THREE.GLTFLoader()

        loader.load(
          "https://zmtbsodvdekwtp1d.public.blob.vercel-storage.com/master_asm.glb",
          (gltf) => {
            console.log("Model loaded successfully", gltf)
            const model = gltf.scene

            // Enable shadows
            model.traverse((child) => {
              if (child.isMesh) {
                child.castShadow = true
                child.receiveShadow = true

                // Ensure materials are visible
                if (child.material) {
                  if (Array.isArray(child.material)) {
                    child.material.forEach((mat) => {
                      mat.needsUpdate = true
                    })
                  } else {
                    child.material.needsUpdate = true
                  }
                }
              }
            })

            // Get bounding box and center the model
            const box = new THREE.Box3().setFromObject(model)
            const center = box.getCenter(new THREE.Vector3())
            const size = box.getSize(new THREE.Vector3())

            // Scale model to reasonable size
            const maxDim = Math.max(size.x, size.y, size.z)
            const scale = 8 / maxDim
            model.scale.setScalar(scale)

            // Center the model
            model.position.sub(center.multiplyScalar(scale))

            scene.add(model)

            // Position camera to view the model
            const distance = maxDim * scale * 1.5
            camera.position.set(distance, distance * 0.8, distance)
            camera.lookAt(0, 0, 0)
            controls.update()

            setLoading(false)
          },
          (progress) => {
            console.log("Loading progress:", (progress.loaded / progress.total) * 100 + "%")
          },
          (error) => {
            console.error("Error loading GLB model:", error)
            setError("Failed to load 3D model")
            setLoading(false)
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

          const newWidth = mountRef.current.clientWidth
          const newHeight = mountRef.current.clientHeight

          camera.aspect = newWidth / newHeight
          camera.updateProjectionMatrix()
          renderer.setSize(newWidth, newHeight)
        }

        window.addEventListener("resize", handleResize)

        // Store cleanup function
        cleanupRef.current = () => {
          window.removeEventListener("resize", handleResize)

          if (animationId) {
            cancelAnimationFrame(animationId)
          }

          if (mountRef.current && renderer.domElement && mountRef.current.contains(renderer.domElement)) {
            mountRef.current.removeChild(renderer.domElement)
          }

          renderer.dispose()
          scene.clear()
        }
      } catch (err) {
        console.error("Error initializing viewer:", err)
        setError("Failed to initialize 3D viewer")
        setLoading(false)
      }
    }

    initViewer()

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current()
      }
    }
  }, [])

  if (loading) {
    return (
      <div className="w-full h-full min-h-[400px] rounded-lg overflow-hidden bg-muted flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading 3D model...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-full min-h-[400px] rounded-lg overflow-hidden bg-muted flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-2">Error loading 3D model</p>
          <p className="text-muted-foreground text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={mountRef}
      className="w-full h-full min-h-[400px] rounded-lg overflow-hidden bg-muted"
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
            <div className="aspect-video w-full rounded-lg overflow-hidden">
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
