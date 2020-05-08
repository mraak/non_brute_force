//
//  InterfaceController.swift
//  WatchReactions WatchKit Extension
//
//  Created by Alen Balja on 05.04.20.
//  Copyright © 2020 Wunderapps. All rights reserved.
//

import WatchKit
import AVFoundation


class InterfaceController: WKInterfaceController, SoundPlaying {
    var audioPlayer: AVAudioPlayer?
    override func awake(withContext context: Any?) {
        super.awake(withContext: context)
        
        // Configure interface objects here.
    }
    
    override func willActivate() {
        // This method is called when watch view controller is about to be visible to user
        super.willActivate()
    }
    
    override func didDeactivate() {
        // This method is called when watch view controller is no longer visible
        super.didDeactivate()
    }

    
    @IBAction func playSound1() {
        playSound(named: "jodoga")
    }
    @IBAction func playSound2() {
        playSound(named: "tschuk")
    }
    @IBAction func playSound3() {
        playSound(named: "tschuk")
    }
    @IBAction func playSound4() {
        playSound(named: "jodoga")
    }
}
