//
//  InterfaceController.swift
//  HelloWatch WatchKit Extension
//
//  Created by Alen Balja on 02.04.20.
//  Copyright © 2020 Wunderapps. All rights reserved.
//

import WatchKit
import Foundation
import HealthKit

class InterfaceController: WKInterfaceController {
    
    @IBOutlet var categoryLabel: WKInterfaceLabel!
//    let typesToShare: Set = [
//        HKQuantityType.workoutType()
//    ]
//
//    // The quantity types to read from the health store.
//    let typesToRead: Set = [
//        HKQuantityType.quantityType(forIdentifier: .heartRate)!,
//        HKQuantityType.quantityType(forIdentifier: .activeEnergyBurned)!,
//        HKQuantityType.quantityType(forIdentifier: .distanceWalkingRunning)!
//    ]

    
    
    override func awake(withContext context: Any?) {
        super.awake(withContext: context)
        // Configure interface objects here.
        
        authorizeHealthKit()
        
//        if HKHealthStore.isHealthDataAvailable() {
//            debugPrint("HK")
//            let healthStore = HKHealthStore()
//            // Request authorization for those quantity types.
//            healthStore.requestAuthorization(toShare: typesToShare, read: typesToRead) { (success, error) in
//                // Handle error. No error handling in this sample project.
//            }
//            let configuration = HKWorkoutConfiguration()
//            configuration.activityType = .running
//            configuration.locationType = .outdoor
//            let session: HKWorkoutSession
//            let builder: HKLiveWorkoutBuilder
//
//            do {
//                session = try HKWorkoutSession(healthStore: healthStore, configuration: configuration)
//                builder = session.associatedWorkoutBuilder()
//            } catch {
//                dismiss()
//                return
//            }
//            builder.dataSource = HKLiveWorkoutDataSource(healthStore: healthStore,
//            workoutConfiguration: configuration)
//
//            session.startActivity(with: Date())
//            builder.beginCollection(withStart: Date()) { (success, error) in
//                self.setDurationTimerDate(.running)
//            }
//        }

    }
    private func authorizeHealthKit() {
      HealthKitSetupAssistant.authorizeHealthKit { (authorized, error) in
            
        guard authorized else {
              
          let baseMessage = "HealthKit Authorization Failed"
              
          if let error = error {
            print("\(baseMessage). Reason: \(error.localizedDescription)")
          } else {
            print(baseMessage)
          }
              
          return
        }
            
        print("HealthKit Successfully Authorized.")
      }
    }
    
    override func willActivate() {
        // This method is called when watch view controller is about to be visible to user
        super.willActivate()
        debugPrint("willActivate")

    }
    
    override func didDeactivate() {
        // This method is called when watch view controller is no longer visible
        super.didDeactivate()
        
        debugPrint("didDeactivate")

    }
    
    func dataToRead() -> NSSet{
        let heightType = HKObjectType.quantityType(forIdentifier: .height)!
//        let heightType = HKObjectType.quantityTypeforIdentifier(HKQuantityTypeIdentifierHeight)
        return NSSet(objects: heightType)
    }
    
    func setDurationTimerDate(_: HKWorkoutActivityType) {
        
    }

}
