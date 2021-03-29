//
//  InterfaceController.swift
//  Heart Rate Monitor WatchKit Extension
//
//  Created by Justin Trautman on 8/5/19.
//  Copyright © 2019 Watch Coder. All rights reserved.
//

import Foundation
import HealthKit
import WatchKit

class InterfaceController: WKInterfaceController {

    // MARK: - Outlets
    @IBOutlet var heartScene: WKInterfaceSKScene!
    @IBOutlet var bpmLabel: WKInterfaceLabel!
    @IBOutlet var heartRateSpeedLabel: WKInterfaceLabel!

    // MARK: - Properties
    var healthStore: HKHealthStore?
    var session: HKWorkoutSession?
    var lastHeartRate = 0.0
    let beatCountPerMinute = HKUnit(from: "count/min")

    override func awake(withContext context: Any?) {
        super.awake(withContext: context)

        let sampleType: Set<HKSampleType> = [HKSampleType.quantityType(forIdentifier: .heartRate)!]

        healthStore = HKHealthStore()

        let configuration = HKWorkoutConfiguration()
        configuration.activityType = .running
        configuration.locationType = .outdoor

        do {
            session = try HKWorkoutSession(healthStore: healthStore!, configuration: self.workoutConfiguration())!
            builder = session.associatedWorkoutBuilder()
            builder.dataSource = HKLiveWorkoutDataSource(healthStore: healthStore,
                                             workoutConfiguration: workoutConfiguration())
        } catch {
            // Handle any exceptions.
            return
        }

        // Setup session and builder.
        session.delegate = self
        builder.delegate = self

        healthStore?.requestAuthorization(toShare: sampleType, read: sampleType, completion: { (success, error) in
            if success {
                self.startHeartRateQuery(quantityTypeIdentifier: .heartRate)
            }
        })

        session.startActivity(with: Date())
        builder.beginCollection(withStart: Date()) { (success, error) in
            // The workout has started.
        }
    }

    override func willActivate() {
        // This method is called when watch view controller is about to be visible to user
        super.willActivate()
    }

    override func didDeactivate() {
        // This method is called when watch view controller is no longer visible
        super.didDeactivate()
    }

    private func startHeartRateQuery(quantityTypeIdentifier: HKQuantityTypeIdentifier) {

        // 1
        let devicePredicate = HKQuery.predicateForObjects(from: [HKDevice.local()])

        // 2
        let updateHandler: (HKAnchoredObjectQuery, [HKSample]?, [HKDeletedObject]?, HKQueryAnchor?, Error?) -> Void = {
            query, samples, deletedObjects, queryAnchor, error in

            // 3
            guard let samples = samples as? [HKQuantitySample] else { return }

            self.process(samples, type: quantityTypeIdentifier)
        }

        // 4
        let query = HKAnchoredObjectQuery(type: HKObjectType.quantityType(forIdentifier: quantityTypeIdentifier)!, predicate: devicePredicate, anchor: nil, limit: HKObjectQueryNoLimit, resultsHandler: updateHandler)

        query.updateHandler = updateHandler

        // 5
        healthStore?.execute(query)
    }

    private func process(_ samples: [HKQuantitySample], type: HKQuantityTypeIdentifier) {
        for sample in samples {
            if type == .heartRate {
                lastHeartRate = sample.quantity.doubleValue(for: beatCountPerMinute)
                print("❤ Last heart rate was: \(lastHeartRate)")
            }

            updateHeartRateLabel()
            updateHeartRateSpeedLabel()
            sendReport()
        }
    }

    private func updateHeartRateLabel() {
        let heartRate = String(Int(lastHeartRate))
        bpmLabel.setText(heartRate)
    }

    private func updateHeartRateSpeedLabel() {
        switch lastHeartRate {
        case _ where lastHeartRate > 130:
            heartRateSpeedLabel.setText("High")
            heartRateSpeedLabel.setTextColor(.red)
        case _ where lastHeartRate > 100:
            heartRateSpeedLabel.setText("Moderate")
            heartRateSpeedLabel.setTextColor(.yellow)
        default:
            heartRateSpeedLabel.setText("Low")
            heartRateSpeedLabel.setTextColor(.blue)
        }
    }

    private func sendReport() {
        guard let encoded = try? JSONEncoder().encode(lastHeartRate) else {
            print("Failed to encode heart rate")
            return
        }

        let url = URL(string: "https://heartrate.miran248.vercel.app/api/beat")!
        var request = URLRequest(url: url)
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpMethod = "POST"
        request.httpBody = encoded

        URLSession.shared.dataTask(with: request) { data, response, error in
            guard let data = data else {
                print("No data in response: \(error?.localizedDescription ?? "Unknown error").")
                return
            }
        }.resume()
    }
}
