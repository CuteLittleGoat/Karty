import org.gradle.api.GradleException

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("com.google.gms.google-services")
}

android {
    namespace = "com.karty.mainmobile"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.karty.mainmobile"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        viewBinding = true
    }
}

val launcherIconSource = rootProject.file("Pliki/Ikona.png")
val generatedIconResDir = layout.buildDirectory.dir("generated/icon-res")

android.sourceSets.getByName("main").res.srcDir(generatedIconResDir)

tasks.register<Copy>("prepareLauncherIcon") {
    from(launcherIconSource)
    into(generatedIconResDir.map { it.dir("drawable") })
    rename { "ic_launcher_foreground_png.png" }

    doFirst {
        if (!launcherIconSource.exists()) {
            throw GradleException("Brak pliku ikony: ${launcherIconSource.absolutePath}")
        }
    }
}

tasks.named("preBuild").configure {
    dependsOn("prepareLauncherIcon")
}

dependencies {
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("com.google.android.material:material:1.12.0")
    implementation("androidx.webkit:webkit:1.11.0")

    implementation(platform("com.google.firebase:firebase-bom:33.2.0"))
    implementation("com.google.firebase:firebase-messaging-ktx")

    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.2.1")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.6.1")
}
